import {SupportedExportFormats} from '@/types/export';
import {PluginKey} from '@/types/plugin';
import {IconFileExport, IconMoon, IconSun} from '@tabler/icons-react';
import {useTranslation} from 'next-i18next';
import {FC} from 'react';
import {Import} from '../Settings/Import';
import {Key} from '../Settings/Key';
import {SidebarButton} from '../Sidebar/SidebarButton';
import {ClearConversations} from './ClearConversations';
import {PluginKeys} from './PluginKeys';
import {LogoutButton} from './LogoutButton';

interface Props {
    lightMode: 'light' | 'dark';
    apiKey: string;
    serverSideApiKeyIsSet: boolean;
    pluginKeys: PluginKey[];
    serverSidePluginKeysSet: boolean;
    conversationsCount: number;
    invitationCode: string;
    onToggleLightMode: (mode: 'light' | 'dark') => void;
    onApiKeyChange: (apiKey: string) => void;
    onClearConversations: () => void;
    onExportConversations: () => void;
    onImportConversations: (data: SupportedExportFormats) => void;
    onPluginKeyChange: (pluginKey: PluginKey) => void;
    onClearPluginKey: (pluginKey: PluginKey) => void;
    onLogout: () => void;
    onCopyInvitationCode: () => void;
}

export const ChatbarSettings: FC<Props> = ({
                                               lightMode,
                                               apiKey,
                                               serverSideApiKeyIsSet,
                                               pluginKeys,
                                               serverSidePluginKeysSet,
                                               conversationsCount,
                                               invitationCode,
                                               onToggleLightMode,
                                               onApiKeyChange,
                                               onClearConversations,
                                               onExportConversations,
                                               onImportConversations,
                                               onPluginKeyChange,
                                               onClearPluginKey,
                                               onLogout,
                                               onCopyInvitationCode,
                                           }) => {
    const {t} = useTranslation('sidebar');

    return (
        <>
            <div className="flex flex-row items-center space-y-1 border-t border-white/20 pt-1 text-sm">
                <button
                    className="flex w-full cursor-pointer select-none items-center gap-3 rounded-md py-3 px-3 text-[14px] leading-3 text-white transition-colors duration-200 hover:bg-gray-500/10"
                    onClick={onCopyInvitationCode}
                >
                    邀请码：{invitationCode} 点击复制
                </button>
            </div>
            <div className="flex flex-col items-center space-y-1 border-t border-white/20 pt-1 text-sm">
                {conversationsCount > 0 ? (
                    <ClearConversations
                        onClearConversations={onClearConversations}/>
                ) : null}

                {/*<Import onImport={onImportConversations}/>*/}

                <SidebarButton
                    text={t('Export data')}
                    icon={<IconFileExport size={18}/>}
                    onClick={() => onExportConversations()}
                />

                <SidebarButton
                    text={lightMode === 'light' ? t('Dark mode') : t('Light mode')}
                    icon={
                        lightMode === 'light' ? <IconMoon size={18}/> :
                            <IconSun size={18}/>
                    }
                    onClick={() =>
                        onToggleLightMode(lightMode === 'light' ? 'dark' : 'light')
                    }
                />

                {!(serverSideApiKeyIsSet) ? (
                    <Key apiKey={apiKey} onApiKeyChange={onApiKeyChange}/>
                ) : null}

                {!(serverSidePluginKeysSet) ? (
                    <PluginKeys
                        pluginKeys={pluginKeys}
                        onPluginKeyChange={onPluginKeyChange}
                        onClearPluginKey={onClearPluginKey}
                    />
                ) : null}
                <LogoutButton onLogout={onLogout} />

            </div>
        </>

    );
};
