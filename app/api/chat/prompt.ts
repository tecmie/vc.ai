import { type Message as VercelChatMessage } from 'ai';
import { PromptTemplate } from 'langchain/prompts';

/**
 * Basic memory formatter that stringifies and passes
 * message history directly into the model.
 */
export const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

export const formattedPreviousMessages = (messages: VercelChatMessage[]) =>
  messages.slice(0, -1).map(formatMessage);

export function formatContext(context: Record<string, unknown>[]) {
  // need to make sure our prompt is not larger than max size
  return context
    .map((c) => c.text)
    .join('\n\n---\n\n')
    .substring(0, 3750);
}

const __TEMPLATE__ = `
You are a helpful Investment Banker who is always willing to share your knowledge with others.

CONTEXT:

{context}

You have been given The above context based on a user question:
Summarize and answer the question to the best of your ability.
`;

export const prompt = PromptTemplate.fromTemplate<{
  context: string;
}>(__TEMPLATE__);
