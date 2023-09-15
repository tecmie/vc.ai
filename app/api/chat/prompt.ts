import { type Message as VercelChatMessage } from 'ai';
import { PromptTemplate } from 'langchain/prompts';

/**
 * Basic memory formatter that stringifies and passes
 * message history directly into the model.
 */
export const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};



/**
 * Picks the last 3 items from an array if the array length is at least 3.
 * @param {Array} array - The array to pick items from.
 * @return {Array|null} - An array of the last 3 items or the last item if the array length is less than 3.
 */
export function lastSelectFromArray(array: VercelChatMessage[]) {
  if (array.length < 3) {
    return array.slice(0, -1);;
  }
  return array.slice(-3);
}

export const formattedPreviousMessages = (messages: VercelChatMessage[]) =>
lastSelectFromArray(messages).map(formatMessage);

export function formatContext(context: Record<string, unknown>[]) {
  // need to make sure our prompt is not larger than max size
  return context
    .map((c) => c.text)
    .join('\n\n---\n\n')
    .substring(0, 3750);
}

const __BASE_TEMPLATE__ = `
You are an AI Assistant specialized in assisting Startup Founders, Entrepreneurs, and Small Business Owners. Your primary goal is to provide well-informed, actionable advice and responses based on the user's questions and context provided.

MAIN CONTEXT:
{main_context}

PREVIOUS INTERACTIONS:
{previous_interactions}

QUESTION FROM USER:
{user_question}

Please use the main context and previous interactions to formulate an informative and appropriate response to the user's question. If the question is a greeting or a pleasantry, respond accordingly.

RESPONSE:`;

const __TEMPLATE__ = `
You are a Virtual Assistant to a Startup Founder/Entrepreneur. You have access to a broad database of investors across multiple sectors, including Government offices, accelerators, micro VCs, and angel investors.

CONTEXT:

{context}

Based on the user's inquiry:
- If it's a specific question related to investors or startup funding, consult the investor database and provide the most actionable and precise advice.
- If the user inquires about other aspects of running a startup, such as marketing, tech, or operations, try to offer useful insights or suggestions.
- If it's just a greeting or pleasantry, reciprocate with a polite and welcoming tone.

USER QUESTION:

{user_question}

RESPONSE:`;

export const prompt = PromptTemplate.fromTemplate<{
  main_context: string;
  previous_interactions?: string;
  user_question: string;
}>(__BASE_TEMPLATE__);


/**
 * Picks a random string from an array of strings.
 * @param {string[]} stringArray - An array of strings to choose from.
 * @return {string} - A random string picked from the array.
 */
 export function sampler(stringArray: string[]) {
  const randomIndex = Math.floor(Math.random() * stringArray.length);
  return stringArray[randomIndex];
}
