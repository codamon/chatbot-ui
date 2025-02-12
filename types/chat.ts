import { OpenAIModel } from './openai';

export interface Message {
  role: Role;
  content: string;
  chatID?: Number;
}

export type Role = 'assistant' | 'user';

export interface ChatBody {
  model: OpenAIModel;
  messages: Message[];
  key: string;
  prompt: string;
  conversation: Conversation;
}

export interface Conversation {
  id: Number;
  name: string;
  messages: Message[];
  model: OpenAIModel;
  prompt: string;
  folderId: string | null;
}
