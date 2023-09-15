import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

const exampleMessages = [
  {
    heading: 'Find a type of Investor',
    message: `I need investors from Government Offices"?`
  },
  {
    heading: 'Recommend a Investor',
    message: 'Recommend a VC or accelerator for AI companies: \n'
  },
  {
    heading: 'Draft a message for an Investor',
    message: `Draft an email I can send to Marc Andressen: \n`
  }
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="max-w-2xl px-4 mx-auto">
      <div className="p-8 border rounded-lg bg-background">
        <h1 className="mb-2 text-lg font-semibold">
          Welcome to VC AI Chatbot!
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          This is simple chatbot app template built with{' '}
          <ExternalLink href="https://nextjs.org">Next.js</ExternalLink> and{' '}
          <ExternalLink href="https://vercel.com/storage/kv">
            Vercel KV
          </ExternalLink>
          .
        </p>
        <p className="leading-normal text-muted-foreground">
          You can start a conversation here or try the following examples:
        </p>
        <div className="flex flex-col items-start mt-4 space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
