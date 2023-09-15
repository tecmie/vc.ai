import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'

import { nanoid } from '@/lib/utils'
import { prompt } from './prompt';
import { connect, OpenAIEmbeddingFunction } from 'vectordb'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { BytesOutputParser } from 'langchain/schema/output_parser';
import { LanceDB } from "langchain/vectorstores/lancedb";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";


const embeddings = new OpenAIEmbeddingFunction('pageContent', process.env.OPENAI_API_KEY as string);


const session = {
  user: {
    id: 'hack',
    name: 'Hack',
    email: 'hack@angel.com',
}
}

// export const runtime = 'edge'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken } = json

  console.log(messages)

  if (previewToken) {
    configuration.apiKey = previewToken
  }

  /* Store manager, pre generation */

      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload = {
        id,
        title,
        userId: session.user.id,
        createdAt,
        path,
        messages
      }
      await kv.hmset(`chat:${id}`, payload)
      await kv.zadd(`user:chat:${session.user.id}`, {
        score: createdAt,
        member: `chat:${id}`
      })

  const currentMessageContent = messages[messages.length - 1].content;

  


   /**
   * Vector Retrieval step for our actor
   * We read the actor information from request cookie
   * And use it to perform a similarity search on LanceDB
   **/
    const db = await connect('/Users/apple/srv/koolamusic/rag/data');
    // const table = await db.openTable('investors', embeddings);


    const table = await db.openTable("investors");
  
    const vectorStore = new LanceDB(new OpenAIEmbeddings(), { table });
  



    /**
     * We need to filter out the messages that are not tweets
     * or quote tweets when executing our queries
     *
     * @see https://lancedb.github.io/lancedb/sql/
     */
    // const results = await table
    //   .search(currentMessageContent)
    //   .limit(3)
    //   .execute();
  
    // // need to make sure our prompt is not larger than max size
    // const formattedContext = results
    //   .map((r) => r.pageContent)
    //   .join('\n\n---\n\n')
    //   .substring(0, 3750);
  



    //   console.log({
    //     formattedContext,
    //   })


    let streamedResponse = "";

    /**
   * See a full list of supported models at:
   * https://js.langchain.com/docs/modules/model_io/models/
   */
    const model = new ChatOpenAI({
      temperature: 0.7,
      streaming: true,
      callbacks: [
        {
          handleLLMNewToken(token) {
            streamedResponse += token;
          },
        },
      ],

      /**
       * @args
       * We use this to enable context in the user
       * facing tweet generation input box
       */
      prefixMessages: messages,
      presencePenalty: 0.111,
      frequencyPenalty: 0.333,
      modelName: 'gpt-3.5-turbo-0301',
      verbose:  false,
    });



    /* Create the chain */
const chain = ConversationalRetrievalQAChain.fromLLM(
  model,
  vectorStore.asRetriever()
);



/**
 * Chat models stream message chunks rather than bytes, so this
 * output parser handles serialization and encoding.
 */
const outputParser = new BytesOutputParser();
const res = await chain.call({ question: currentMessageContent, chat_history: JSON.stringify(messages), });

    /*
    * Can also initialize as:
    *
    * import { RunnableSequence } from "langchain/schema/runnable";
    * const chain = RunnableSequence.from([prompt, model, outputParser]);
    */
    // const chain = prompt.pipe(model).pipe(outputParser);

    // const stream = await chain.stream({
    //   context: formattedContext,
    // });

    // return new StreamingTextResponse(res)
    // return res;

    console.log(streamedResponse)



    return new StreamingTextResponse(streamedResponse as any);
    



  // const res = await openai.createChatCompletion({
  //   model: 'gpt-3.5-turbo',
  //   messages,
  //   temperature: 0.7,
  //   stream: true
  // })

  // const stream = OpenAIStream(res, {
  //   async onCompletion(completion) {
  //     const title = json.messages[0].content.substring(0, 100)
  //     const id = json.id ?? nanoid()
  //     const createdAt = Date.now()
  //     const path = `/chat/${id}`
  //     const payload = {
  //       id,
  //       title,
  //       userId: session.user.id,
  //       createdAt,
  //       path,
  //       messages: [
  //         ...messages,
  //         {
  //           content: completion,
  //           role: 'assistant'
  //         }
  //       ]
  //     }
  //     await kv.hmset(`chat:${id}`, payload)
  //     await kv.zadd(`user:chat:${session.user.id}`, {
  //       score: createdAt,
  //       member: `chat:${id}`
  //     })
  //   }
  // })

  // return new StreamingTextResponse(stream)
}
