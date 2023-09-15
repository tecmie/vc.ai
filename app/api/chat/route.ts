import { kv } from '@vercel/kv'
import { StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'

import { nanoid } from '@/lib/utils'
import { formattedPreviousMessages, prompt, sampler } from './prompt';
import { connect, OpenAIEmbeddingFunction } from 'vectordb'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { BytesOutputParser } from 'langchain/schema/output_parser';

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
  const db = await connect(process.env.VECTOR_DB_DIR as string);
  const table = await db.openTable('investors', embeddings);

  /**
   * We need to filter out the messages that are not tweets
   * or quote tweets when executing our queries
   *
   * @see https://lancedb.github.io/lancedb/sql/
   */
  const results = await table
    .search(currentMessageContent)
    .limit(4)
    .execute();

  // need to make sure our prompt is not larger than max size
  const formattedContext = results
    .map((r) => r.pageContent)
    .join('\n\n---\n\n')
    .substring(0, 3750);




  console.log({
    formattedContext,
  })


  /**
* See a full list of supported models at:
* https://js.langchain.com/docs/modules/model_io/models/
//  */
  const model = new ChatOpenAI({
    temperature: 0.7,
    

    /**
     * @args
     * We use this to enable context in the user
     * facing tweet generation input box
     */
    prefixMessages: messages,
    presencePenalty: 0.111,
    frequencyPenalty: 0.333,
    modelName: sampler(['gpt-3.5-turbo-0301', 'gpt-3.5-turbo-0301', 'gpt-4-0314']),
    verbose: true,
  });

  /**
   * Chat models stream message chunks rather than bytes, so this
   * output parser handles serialization and encoding.
   */
  const outputParser = new BytesOutputParser();

  /*
  * Can also initialize as:
  *
  * import { RunnableSequence } from "langchain/schema/runnable";
  * const chain = RunnableSequence.from([prompt, model, outputParser]);
  */
  const chain = prompt.pipe(model).pipe(outputParser);

  const stream = await chain.stream({
    main_context: formattedContext,
    previous_interactions: formattedPreviousMessages(messages).join('\n'),
    user_question: currentMessageContent,
  });

  return new StreamingTextResponse(stream);
}
