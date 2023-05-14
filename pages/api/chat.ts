import {ChatBody, Message} from '@/types/chat';
import {DEFAULT_SYSTEM_PROMPT} from '@/utils/app/const';
import {OpenAIError, OpenAIStream} from '@/utils/server';
import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
import {init, Tiktoken} from '@dqbd/tiktoken/lite/init';
import apiClient from "@/utils/app/apiClient";

export const config = {
    runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
    try {
        const {model, messages, key, prompt} = (await req.json()) as ChatBody;

        // await init((imports) => WebAssembly.instantiate(wasm, imports));
        const encoding = new Tiktoken(
            tiktokenModel.bpe_ranks,
            tiktokenModel.special_tokens,
            tiktokenModel.pat_str,
        );

        let promptToSend = prompt;
        if (!promptToSend) {
            promptToSend = DEFAULT_SYSTEM_PROMPT;
        }

        const prompt_tokens = encoding.encode(promptToSend);

        let tokenCount = prompt_tokens.length;
        let messagesToSend: Message[] = [];

        for (let i = messages?.length - 1; i >= 0; i--) {
            const message = messages[i];
            const tokens = encoding.encode(message.content);

            if (tokenCount + tokens.length + 1000 > model.tokenLimit) {
                break;
            }
            tokenCount += tokens.length;
            messagesToSend = [message, ...messagesToSend];
        }

        encoding.free();

        const stream = await OpenAIStream(model, promptToSend, key, messagesToSend);

        return new Response(stream);
    } catch (error) {
        console.error(error);
        if (error instanceof OpenAIError) {
            return new Response('Error', {
                status: 500,
                statusText: error.message
            });
        } else {
            return new Response('Error', {status: 500});
        }
    }
};

/**
 * 新建聊天会话
 */
export const createConversation = async (name: String, model: String, prompt: String) => {
    console.log('-createConversation-68:');
    const response = await apiClient.post('/chat_conversations/create', {name, model, prompt});
    return response.data.data.conversation;
}

/**
 * 获取聊天记录通过相应的ID
 */
export const fetchMessages = async (conversationID: Number) => {
    const response = await apiClient.post('/chat_messages', {message_id: conversationID});
    return response.data.data.messages;
};

/**
 * 获取聊天记录列表
 */
export const fetchConversations = async () => {
    const response = await apiClient.get('/chat_conversations');
    return response.data.data.conversations;
}

/**
 * 更新会话名称
 */
export const updateConversationName = async (conversationID: Number, name: String, model: String, prompt: String) => {
    await apiClient.post('/chat_conversations/update', {id: conversationID, name: name, model, prompt});
    return;
}

/**
 * 删除会话
 */
export const deleteConversation = async (conversationID: Number) => {
    const response = await apiClient.post('/chat_conversations/delete', {id: conversationID});
    return response;
}

/**
 * 删除所有会话
 */
export const clearAllConversations = async () => {
    const response = await apiClient.post('/chat_conversations/clear_all');
    return response.data.status;
}

export default handler;
