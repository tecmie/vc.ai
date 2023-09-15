import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'

import { nanoid } from '@/lib/utils'
import { connect, OpenAIEmbeddingFunction } from 'vectordb'

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

  if (previewToken) {
    configuration.apiKey = previewToken
  }


   /**
   * Vector Retrieval step for our actor
   * We read the actor information from request cookie
   * And use it to perform a similarity search on LanceDB
   **/
    const db = await connect('data');
    const table = await db.openTable('investors', embeddings);
  
    /**
     * We need to filter out the messages that are not tweets
     * or quote tweets when executing our queries
     *
     * @see https://lancedb.github.io/lancedb/sql/
     */
    const results = await table
      // .search("")
      .search('investors in europe')
      .limit(5)
      .execute();
  
    // need to make sure our prompt is not larger than max size
    const formattedContext = results
      .map((r) => r.text)
      .join('\n\n---\n\n')
      .substring(0, 3750);
  



      console.log({
        results,
        formattedContext,
      })



  const res = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    stream: true
  })

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
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
        messages: [
          ...messages,
          {
            content: completion,
            role: 'assistant'
          }
        ]
      }
      await kv.hmset(`chat:${id}`, payload)
      await kv.zadd(`user:chat:${session.user.id}`, {
        score: createdAt,
        member: `chat:${id}`
      })
    }
  })

  return new StreamingTextResponse(stream)
}
