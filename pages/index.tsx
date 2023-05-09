import {Chat} from '@/components/Chat/Chat';
import {Chatbar} from '@/components/Chatbar/Chatbar';
import {Navbar} from '@/components/Mobile/Navbar';
import {Promptbar} from '@/components/Promptbar/Promptbar';
import {ChatBody, Conversation, Message} from '@/types/chat';
import {KeyValuePair} from '@/types/data';
import {ErrorMessage} from '@/types/error';
import {LatestExportFormat, SupportedExportFormats} from '@/types/export';
import {Folder, FolderType} from '@/types/folder';
import {
    OpenAIModel,
    OpenAIModelID,
    OpenAIModels,
    fallbackModelID,
} from '@/types/openai';
import {Plugin, PluginKey} from '@/types/plugin';
import {Prompt} from '@/types/prompt';
import {getEndpoint} from '@/utils/app/api';
import {
    cleanConversationHistory,
    cleanSelectedConversation,
} from '@/utils/app/clean';
import {DEFAULT_SYSTEM_PROMPT} from '@/utils/app/const';
import {
    saveConversation,
    saveConversations,
    updateConversation,
} from '@/utils/app/conversation';
import {saveFolders} from '@/utils/app/folders';
import {exportData, importData} from '@/utils/app/importExport';
import {savePrompts} from '@/utils/app/prompts';
import {IconArrowBarLeft, IconArrowBarRight} from '@tabler/icons-react';
import {GetServerSideProps} from 'next';
import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import {useEffect, useRef, useState} from 'react';
import toast from 'react-hot-toast';
import {v4 as uuidv4} from 'uuid';
import { useRouter } from "next/router";
import apiClient from "@/utils/app/apiClient";
import axios from "axios/index";

interface HomeProps {
    serverSideApiKeyIsSet: boolean;
    serverSidePluginKeysSet: boolean;
    defaultModelId: OpenAIModelID;
}

const Home: React.FC<HomeProps> = ({
                                       serverSideApiKeyIsSet,
                                       serverSidePluginKeysSet,
                                       defaultModelId,
                                   }) => {
    const {t} = useTranslation('chat');
    const router = useRouter();

    // STATE ----------------------------------------------

    const [apiKey, setApiKey] = useState<string>('');
    const [pluginKeys, setPluginKeys] = useState<PluginKey[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [lightMode, setLightMode] = useState<'dark' | 'light'>('dark');
    const [messageIsStreaming, setMessageIsStreaming] = useState<boolean>(false);

    const [modelError, setModelError] = useState<ErrorMessage | null>(null);

    const [models, setModels] = useState<OpenAIModel[]>([]);

    const [folders, setFolders] = useState<Folder[]>([]);

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] =
        useState<Conversation>();
    const [currentMessage, setCurrentMessage] = useState<Message>();

    const [showSidebar, setShowSidebar] = useState<boolean>(true);

    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [showPromptbar, setShowPromptbar] = useState<boolean>(true);

    // REFS ----------------------------------------------

    const stopConversationRef = useRef<boolean>(false);

    // FETCH RESPONSE ----------------------------------------------

    /**
     * 如果存在选中的会话，执行以下步骤。
     * 根据传入的参数（deleteCount 和 plugin），更新会话的消息。
     * 准备请求消息，包括 chatBody、endpoint 和 body。
     * 发送请求，并处理响应。
     * 如果响应成功，根据是否使用插件执行不同的逻辑。
     * 更新会话消息，并在结束时保存会话。
     * @param message
     * @param deleteCount
     * @param plugin
     */
    const handleSend = async (
        message: Message,           // 要发送的消息对象
        deleteCount = 0,    // 要从会话中删除的消息数量
        plugin: Plugin | null = null // 可选插件
    ) => {
        if (selectedConversation) { // 如果选中了会话
            // 更新会话逻辑
            let updatedConversation: Conversation;

            if (deleteCount) {
                const updatedMessages = [...selectedConversation.messages];
                for (let i = 0; i < deleteCount; i++) {
                    updatedMessages.pop();
                }

                updatedConversation = {
                    ...selectedConversation,
                    messages: [...updatedMessages, message],
                };
            } else {
                updatedConversation = {
                    ...selectedConversation,
                    messages: [...selectedConversation.messages, message],
                };
            }

            setSelectedConversation(updatedConversation);
            setLoading(true);
            setMessageIsStreaming(true);

            const chatBody: ChatBody = {
                model: updatedConversation.model,
                messages: updatedConversation.messages,
                key: apiKey,
                prompt: updatedConversation.prompt,
                conversation: updatedConversation,
            };

            const endpoint = getEndpoint(plugin);
            let body;

            console.log('-handleSend-138:', chatBody);

            if (!plugin) {
                body = JSON.stringify(chatBody);
            } else {
                body = JSON.stringify({
                    ...chatBody,
                    googleAPIKey: pluginKeys
                        .find((key) => key.pluginId === 'google-search')
                        ?.requiredKeys.find((key) => key.key === 'GOOGLE_API_KEY')?.value,
                    googleCSEId: pluginKeys
                        .find((key) => key.pluginId === 'google-search')
                        ?.requiredKeys.find((key) => key.key === 'GOOGLE_CSE_ID')?.value,
                });
            }

            // 发送消息请求
            const controller = new AbortController();
            // const response = await fetch(endpoint, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     signal: controller.signal,
            //     body,
            // });

            const accessToken = localStorage.getItem('access_token');
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/chat", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                signal: controller.signal,
                body,
            });


            console.log('-handleSend-163:', response);

            // 处理响应
            if (!response.ok) {
                // 错误处理
                setLoading(false);
                setMessageIsStreaming(false);
                toast.error(response.statusText);
                return;
            }

            const data = response.body;

            if (!data) {
                // 处理空数据
                setLoading(false);
                setMessageIsStreaming(false);
                return;
            }

            if (!plugin) {
                // 更新会话名称和处理数据流
                console.log('-handleSend-189:', updatedConversation.messages);
                if (updatedConversation.messages.length === 1) {
                    const {content} = message;
                    console.log('-handleSend-191:', content);
                    const customName =
                        content.length > 30 ? content.substring(0, 30) + '...' : content;

                    updatedConversation = {
                        ...updatedConversation,
                        name: customName,
                    };
                }

                setLoading(false);

                const reader = data.getReader();
                const decoder = new TextDecoder();
                let done = false;
                let isFirst = true;
                let text = '';

                while (!done) {
                    if (stopConversationRef.current === true) {
                        controller.abort();
                        done = true;
                        break;
                    }

                    // 更新会话消息

                    const {value, done: doneReading} = await reader.read();
                    done = doneReading;
                    let chunkValue = decoder.decode(value);

                    console.log('-handleSend-223:', chunkValue);


                    const lines = chunkValue.split('\n');
                    let realContent = '';
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            // 提取 JSON 字符串并解析
                            const jsonString = line.substring(6);
                            const jsonData = JSON.parse(jsonString);
                            realContent += jsonData.choices[0].delta.content || "";
                        }
                    }
                    chunkValue = realContent;
                    text += chunkValue;

                    if (isFirst) {
                        isFirst = false;
                        const updatedMessages: Message[] = [
                            ...updatedConversation.messages,
                            {role: 'assistant', content: chunkValue},
                        ];

                        updatedConversation = {
                            ...updatedConversation,
                            messages: updatedMessages,
                        };

                        setSelectedConversation(updatedConversation);
                    } else {
                        const updatedMessages: Message[] = updatedConversation.messages.map(
                            (message, index) => {
                                if (index === updatedConversation.messages.length - 1) {
                                    return {
                                        ...message,
                                        content: text,
                                    };
                                }

                                return message;
                            },
                        );

                        updatedConversation = {
                            ...updatedConversation,
                            messages: updatedMessages,
                        };

                        setSelectedConversation(updatedConversation);
                    }
                }

                saveConversation(updatedConversation);

                const updatedConversations: Conversation[] = conversations.map(
                    (conversation) => {
                        if (conversation.id === selectedConversation.id) {
                            return updatedConversation;
                        }

                        return conversation;
                    },
                );

                if (updatedConversations.length === 0) {
                    updatedConversations.push(updatedConversation);
                }

                setConversations(updatedConversations);
                saveConversations(updatedConversations);

                setMessageIsStreaming(false);
            } else {
                const {answer} = await response.json();

                const updatedMessages: Message[] = [
                    ...updatedConversation.messages,
                    {role: 'assistant', content: answer},
                ];

                updatedConversation = {
                    ...updatedConversation,
                    messages: updatedMessages,
                };

                setSelectedConversation(updatedConversation);
                saveConversation(updatedConversation);

                const updatedConversations: Conversation[] = conversations.map(
                    (conversation) => {
                        if (conversation.id === selectedConversation.id) {
                            return updatedConversation;
                        }

                        return conversation;
                    },
                );

                if (updatedConversations.length === 0) {
                    updatedConversations.push(updatedConversation);
                }

                setConversations(updatedConversations);
                saveConversations(updatedConversations);

                setLoading(false);
                setMessageIsStreaming(false);
            }
        }
    };

    // FETCH MODELS ----------------------------------------------
    /**
     这个异步方法用于获取models列表。
     @param {string} key - 用户的OpenAI API密钥。
     定义一个错误对象，其中包含错误标题、错误代码和错误消息数组。
     使用 fetch 发送 POST 请求到 '/api/models'，请求头中包含 Content-Type，
     请求体中包含一个 JSON 字符串，该字符串包含 key 参数。
     如果响应状态不为 'ok'，尝试从响应中解析 JSON 数据，更新错误对象的属性，
     并设置模型错误信息。方法在此返回。
     从响应中解析 JSON 数据。
     如果解析后的数据为空，设置模型错误信息。方法在此返回。
     设置获取到的模型数据，并将模型错误信息设置为 null。
     */
    const fetchModels = async (key: string) => {
        // todo 暂时屏蔽这个方法，因为只有一个模型，而且api没有准备好

        return;

        const error = {
            title: t('Error fetching models.'),
            code: null,
            messageLines: [
                t(
                    'Make sure your OpenAI API key is set in the bottom left of the sidebar.',
                ),
                t('If you completed this step, OpenAI may be experiencing issues.'),
            ],
        } as ErrorMessage;

        const response = await fetch('/api/models', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                key,
            }),
        });

        if (!response.ok) {
            try {
                const data = await response.json();
                Object.assign(error, {
                    code: data.error?.code,
                    messageLines: [data.error?.message],
                });
            } catch (e) {
            }
            setModelError(error);
            return;
        }

        const data = await response.json();

        if (!data) {
            setModelError(error);
            return;
        }

        setModels(data);
        setModelError(null);
    };

    // BASIC HANDLERS --------------------------------------------

    const handleLightMode = (mode: 'dark' | 'light') => {
        setLightMode(mode);
        localStorage.setItem('theme', mode);
    };

    const handleApiKeyChange = (apiKey: string) => {
        setApiKey(apiKey);
        localStorage.setItem('apiKey', apiKey);
    };

    const handlePluginKeyChange = (pluginKey: PluginKey) => {
        if (pluginKeys.some((key) => key.pluginId === pluginKey.pluginId)) {
            const updatedPluginKeys = pluginKeys.map((key) => {
                if (key.pluginId === pluginKey.pluginId) {
                    return pluginKey;
                }

                return key;
            });

            setPluginKeys(updatedPluginKeys);

            localStorage.setItem('pluginKeys', JSON.stringify(updatedPluginKeys));
        } else {
            setPluginKeys([...pluginKeys, pluginKey]);

            localStorage.setItem(
                'pluginKeys',
                JSON.stringify([...pluginKeys, pluginKey]),
            );
        }
    };

    const handleClearPluginKey = (pluginKey: PluginKey) => {
        const updatedPluginKeys = pluginKeys.filter(
            (key) => key.pluginId !== pluginKey.pluginId,
        );

        if (updatedPluginKeys.length === 0) {
            setPluginKeys([]);
            localStorage.removeItem('pluginKeys');
            return;
        }

        setPluginKeys(updatedPluginKeys);

        localStorage.setItem('pluginKeys', JSON.stringify(updatedPluginKeys));
    };

    const onLogout = () => {
        // 清除access token
        localStorage.removeItem('access_token');

        // 跳转到登录页面
        router.push('/login');
    }

    const handleToggleChatbar = () => {
        setShowSidebar(!showSidebar);
        localStorage.setItem('showChatbar', JSON.stringify(!showSidebar));
    };

    const handleTogglePromptbar = () => {
        setShowPromptbar(!showPromptbar);
        localStorage.setItem('showPromptbar', JSON.stringify(!showPromptbar));
    };

    const handleExportData = () => {
        exportData();
    };

    const handleImportConversations = (data: SupportedExportFormats) => {
        const {
            history,
            folders,
            prompts
        }: LatestExportFormat = importData(data);

        setConversations(history);
        setSelectedConversation(history[history.length - 1]);
        setFolders(folders);
        setPrompts(prompts);
    };

    const handleSelectConversation = (conversation: Conversation) => {
        setSelectedConversation(conversation);
        saveConversation(conversation);
    };

    // FOLDER OPERATIONS  --------------------------------------------

    const handleCreateFolder = (name: string, type: FolderType) => {
        const newFolder: Folder = {
            id: uuidv4(),
            name,
            type,
        };

        const updatedFolders = [...folders, newFolder];

        setFolders(updatedFolders);
        saveFolders(updatedFolders);
    };

    const handleDeleteFolder = (folderId: string) => {
        const updatedFolders = folders.filter((f) => f.id !== folderId);
        setFolders(updatedFolders);
        saveFolders(updatedFolders);

        const updatedConversations: Conversation[] = conversations.map((c) => {
            if (c.folderId === folderId) {
                return {
                    ...c,
                    folderId: null,
                };
            }

            return c;
        });
        setConversations(updatedConversations);
        saveConversations(updatedConversations);

        const updatedPrompts: Prompt[] = prompts.map((p) => {
            if (p.folderId === folderId) {
                return {
                    ...p,
                    folderId: null,
                };
            }

            return p;
        });
        setPrompts(updatedPrompts);
        savePrompts(updatedPrompts);
    };

    const handleUpdateFolder = (folderId: string, name: string) => {
        const updatedFolders = folders.map((f) => {
            if (f.id === folderId) {
                return {
                    ...f,
                    name,
                };
            }

            return f;
        });

        setFolders(updatedFolders);
        saveFolders(updatedFolders);
    };

    // CONVERSATION OPERATIONS  --------------------------------------------

    /**
     * 新建一个对话
     */
    const handleNewConversation = async () => {
        // 获取上一个会话
        const lastConversation = conversations[conversations.length - 1];

        // 请求后端获取一个新的聊天ID

        const response = await apiClient.get('/chat_sessions/create');
        const newChatSessionId = response.data.data.id;

        console.log('-handleNewConversation-562:', newChatSessionId);

        // 创建新会话对象，设置 ID、名称、空消息数组和模型等属性
        const newConversation: Conversation = {
            id: newChatSessionId, // uuidv4(), // 为新会话生成唯一 ID
            name: `${t('New Conversation')}`, // 设置新会话的名称
            messages: [], // 初始化空消息数组
            // 使用上一个会话的模型作为新会话的模型，如果没有上一个会话，则使用默认模型
            model: lastConversation?.model || {
                id: OpenAIModels[defaultModelId].id,
                name: OpenAIModels[defaultModelId].name,
                maxLength: OpenAIModels[defaultModelId].maxLength,
                tokenLimit: OpenAIModels[defaultModelId].tokenLimit,
            },
            prompt: DEFAULT_SYSTEM_PROMPT, // 设置默认系统提示
            folderId: null, // 初始化文件夹 ID 为空
        };

        // 将新会话添加到会话数组
        const updatedConversations = [...conversations, newConversation];

        // 设置选中的会话为新会话，并更新会话数组
        setSelectedConversation(newConversation);
        setConversations(updatedConversations);

        // 保存新会话和更新后的会话数组
        saveConversation(newConversation);
        saveConversations(updatedConversations);

        // 设置加载状态为 false
        setLoading(false);
    };

    const handleDeleteConversation = (conversation: Conversation) => {
        const updatedConversations = conversations.filter(
            (c) => c.id !== conversation.id,
        );
        setConversations(updatedConversations);
        saveConversations(updatedConversations);

        if (updatedConversations.length > 0) {
            setSelectedConversation(
                updatedConversations[updatedConversations.length - 1],
            );
            saveConversation(updatedConversations[updatedConversations.length - 1]);
        } else {
            setSelectedConversation({
                id: uuidv4(),
                name: 'New conversation',
                messages: [],
                model: OpenAIModels[defaultModelId],
                prompt: DEFAULT_SYSTEM_PROMPT,
                folderId: null,
            });
            localStorage.removeItem('selectedConversation');
        }
    };

    const handleUpdateConversation = (
        conversation: Conversation,
        data: KeyValuePair,
    ) => {
        const updatedConversation = {
            ...conversation,
            [data.key]: data.value,
        };

        const {single, all} = updateConversation(
            updatedConversation,
            conversations,
        );

        setSelectedConversation(single);
        setConversations(all);
    };

    const handleClearConversations = () => {
        setConversations([]);
        localStorage.removeItem('conversationHistory');

        setSelectedConversation({
            id: uuidv4(),
            name: 'New conversation',
            messages: [],
            model: OpenAIModels[defaultModelId],
            prompt: DEFAULT_SYSTEM_PROMPT,
            folderId: null,
        });
        localStorage.removeItem('selectedConversation');

        const updatedFolders = folders.filter((f) => f.type !== 'chat');
        setFolders(updatedFolders);
        saveFolders(updatedFolders);
    };

    const handleEditMessage = (message: Message, messageIndex: number) => {
        if (selectedConversation) {
            const updatedMessages = selectedConversation.messages
                .map((m, i) => {
                    if (i < messageIndex) {
                        return m;
                    }
                })
                .filter((m) => m) as Message[];

            const updatedConversation = {
                ...selectedConversation,
                messages: updatedMessages,
            };

            const {single, all} = updateConversation(
                updatedConversation,
                conversations,
            );

            setSelectedConversation(single);
            setConversations(all);

            setCurrentMessage(message);
        }
    };

    // PROMPT OPERATIONS --------------------------------------------

    const handleCreatePrompt = () => {
        const newPrompt: Prompt = {
            id: uuidv4(),
            name: `Prompt ${prompts.length + 1}`,
            description: '',
            content: '',
            model: OpenAIModels[defaultModelId],
            folderId: null,
        };

        const updatedPrompts = [...prompts, newPrompt];

        setPrompts(updatedPrompts);
        savePrompts(updatedPrompts);
    };

    const handleUpdatePrompt = (prompt: Prompt) => {
        const updatedPrompts = prompts.map((p) => {
            if (p.id === prompt.id) {
                return prompt;
            }

            return p;
        });

        setPrompts(updatedPrompts);
        savePrompts(updatedPrompts);
    };

    const handleDeletePrompt = (prompt: Prompt) => {
        const updatedPrompts = prompts.filter((p) => p.id !== prompt.id);
        setPrompts(updatedPrompts);
        savePrompts(updatedPrompts);
    };

    // EFFECTS  --------------------------------------------

    useEffect(() => {
        const checkAuth = async () => {
            try {
                console.log('-checkAuth-680:');
                const response = await apiClient.get('/auth/check');

                console.log('-checkAuth-682:', response);

                if (response.status !== 200) {
                    router.push("/login");
                }
            } catch (err) {
                // setError('Invalid email or password');
            }
        };
        checkAuth();
    }, [router]);

    useEffect(() => {
        if (currentMessage) {
            handleSend(currentMessage);
            setCurrentMessage(undefined);
        }
    }, [currentMessage]);

    useEffect(() => {
        if (window.innerWidth < 640) {
            setShowSidebar(false);
        }
    }, [selectedConversation]);

    useEffect(() => {
        if (apiKey) {
            fetchModels(apiKey);
        }
    }, [apiKey]);

    // ON LOAD --------------------------------------------

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (theme) {
            setLightMode(theme as 'dark' | 'light');
        }

        const apiKey = localStorage.getItem('apiKey');
        if (serverSideApiKeyIsSet) {
            fetchModels('');
            setApiKey('');
            localStorage.removeItem('apiKey');
        } else if (apiKey) {
            setApiKey(apiKey);
            fetchModels(apiKey);
        }

        const pluginKeys = localStorage.getItem('pluginKeys');
        if (serverSidePluginKeysSet) {
            setPluginKeys([]);
            localStorage.removeItem('pluginKeys');
        } else if (pluginKeys) {
            setPluginKeys(JSON.parse(pluginKeys));
        }

        if (window.innerWidth < 640) {
            setShowSidebar(false);
        }

        const showChatbar = localStorage.getItem('showChatbar');
        if (showChatbar) {
            setShowSidebar(showChatbar === 'true');
        }

        const showPromptbar = localStorage.getItem('showPromptbar');
        if (showPromptbar) {
            setShowPromptbar(showPromptbar === 'true');
        }

        const folders = localStorage.getItem('folders');
        if (folders) {
            setFolders(JSON.parse(folders));
        }

        const prompts = localStorage.getItem('prompts');
        if (prompts) {
            setPrompts(JSON.parse(prompts));
        }

        const conversationHistory = localStorage.getItem('conversationHistory');
        if (conversationHistory) {
            const parsedConversationHistory: Conversation[] =
                JSON.parse(conversationHistory);
            const cleanedConversationHistory = cleanConversationHistory(
                parsedConversationHistory,
            );
            setConversations(cleanedConversationHistory);
        }

        const selectedConversation = localStorage.getItem('selectedConversation');
        if (selectedConversation) {
            const parsedSelectedConversation: Conversation =
                JSON.parse(selectedConversation);
            const cleanedSelectedConversation = cleanSelectedConversation(
                parsedSelectedConversation,
            );
            setSelectedConversation(cleanedSelectedConversation);
        } else {
            setSelectedConversation({
                id: uuidv4(),
                name: 'New conversation',
                messages: [],
                model: OpenAIModels[defaultModelId],
                prompt: DEFAULT_SYSTEM_PROMPT,
                folderId: null,
            });
        }
    }, [serverSideApiKeyIsSet]);

    return (
        <>
            <Head>
                <title>Local Chat</title>
                <meta name="description" content="ChatGPT but better."/>
                <meta
                    name="viewport"
                    content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no"
                />
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            {selectedConversation && (
                <main
                    className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white ${lightMode}`}
                >
                    <div className="fixed top-0 w-full sm:hidden">
                        <Navbar
                            selectedConversation={selectedConversation}
                            onNewConversation={handleNewConversation}
                        />
                    </div>

                    <div className="flex h-full w-full pt-[48px] sm:pt-0">
                        {showSidebar ? (
                            <div>
                                <Chatbar
                                    loading={messageIsStreaming}
                                    conversations={conversations}
                                    lightMode={lightMode}
                                    selectedConversation={selectedConversation}
                                    apiKey={apiKey}
                                    serverSideApiKeyIsSet={serverSideApiKeyIsSet}
                                    pluginKeys={pluginKeys}
                                    serverSidePluginKeysSet={serverSidePluginKeysSet}
                                    folders={folders.filter((folder) => folder.type === 'chat')}
                                    onToggleLightMode={handleLightMode}
                                    onCreateFolder={(name) => handleCreateFolder(name, 'chat')}
                                    onDeleteFolder={handleDeleteFolder}
                                    onUpdateFolder={handleUpdateFolder}
                                    onNewConversation={handleNewConversation}
                                    onSelectConversation={handleSelectConversation}
                                    onDeleteConversation={handleDeleteConversation}
                                    onUpdateConversation={handleUpdateConversation}
                                    onApiKeyChange={handleApiKeyChange}
                                    onClearConversations={handleClearConversations}
                                    onExportConversations={handleExportData}
                                    onImportConversations={handleImportConversations}
                                    onPluginKeyChange={handlePluginKeyChange}
                                    onClearPluginKey={handleClearPluginKey}
                                    onLogout={onLogout}
                                />

                                <button
                                    className="fixed top-5 left-[270px] z-50 h-7 w-7 hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:top-0.5 sm:left-[270px] sm:h-8 sm:w-8 sm:text-neutral-700"
                                    onClick={handleToggleChatbar}
                                >
                                    <IconArrowBarLeft/>
                                </button>
                                <div
                                    onClick={handleToggleChatbar}
                                    className="absolute top-0 left-0 z-10 h-full w-full bg-black opacity-70 sm:hidden"
                                ></div>
                            </div>
                        ) : (
                            <button
                                className="fixed top-2.5 left-4 z-50 h-7 w-7 text-white hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:top-0.5 sm:left-4 sm:h-8 sm:w-8 sm:text-neutral-700"
                                onClick={handleToggleChatbar}
                            >
                                <IconArrowBarRight/>
                            </button>
                        )}

                        <div className="flex flex-1">
                            <Chat
                                conversation={selectedConversation}
                                messageIsStreaming={messageIsStreaming}
                                apiKey={apiKey}
                                serverSideApiKeyIsSet={serverSideApiKeyIsSet}
                                defaultModelId={defaultModelId}
                                modelError={modelError}
                                models={models}
                                loading={loading}
                                prompts={prompts}
                                onSend={handleSend}
                                onUpdateConversation={handleUpdateConversation}
                                onEditMessage={handleEditMessage}
                                stopConversationRef={stopConversationRef}
                            />
                        </div>

                        {showPromptbar ? (
                            <div>
                                <Promptbar
                                    prompts={prompts}
                                    folders={folders.filter((folder) => folder.type === 'prompt')}
                                    onCreatePrompt={handleCreatePrompt}
                                    onUpdatePrompt={handleUpdatePrompt}
                                    onDeletePrompt={handleDeletePrompt}
                                    onCreateFolder={(name) => handleCreateFolder(name, 'prompt')}
                                    onDeleteFolder={handleDeleteFolder}
                                    onUpdateFolder={handleUpdateFolder}
                                />
                                <button
                                    className="fixed top-5 right-[270px] z-50 h-7 w-7 hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:top-0.5 sm:right-[270px] sm:h-8 sm:w-8 sm:text-neutral-700"
                                    onClick={handleTogglePromptbar}
                                >
                                    <IconArrowBarRight/>
                                </button>
                                <div
                                    onClick={handleTogglePromptbar}
                                    className="absolute top-0 left-0 z-10 h-full w-full bg-black opacity-70 sm:hidden"
                                ></div>
                            </div>
                        ) : (
                            <button
                                className="fixed top-2.5 right-4 z-50 h-7 w-7 text-white hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:top-0.5 sm:right-4 sm:h-8 sm:w-8 sm:text-neutral-700"
                                onClick={handleTogglePromptbar}
                            >
                                <IconArrowBarLeft/>
                            </button>
                        )}
                    </div>
                </main>
            )}
        </>
    );
};
export default Home;

export const getServerSideProps: GetServerSideProps = async ({locale}) => {
    const defaultModelId =
        (process.env.DEFAULT_MODEL &&
            Object.values(OpenAIModelID).includes(
                process.env.DEFAULT_MODEL as OpenAIModelID,
            ) &&
            process.env.DEFAULT_MODEL) ||
        fallbackModelID;

    let serverSidePluginKeysSet = false;

    const googleApiKey = process.env.GOOGLE_API_KEY;
    const googleCSEId = process.env.GOOGLE_CSE_ID;

    if (googleApiKey && googleCSEId) {
        serverSidePluginKeysSet = true;
    }

    return {
        props: {
            serverSideApiKeyIsSet: true,
            defaultModelId,
            serverSidePluginKeysSet,
            ...(await serverSideTranslations(locale ?? 'en', [
                'common',
                'chat',
                'sidebar',
                'markdown',
                'promptbar',
            ])),
        },
    };
};
