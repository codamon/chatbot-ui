import Image from 'next/image'
import chatGPTLogo from '../public/chatgpt.jpeg'  // make sure you have the logo file in the correct path
import Link from 'next/link';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-96 flex flex-col items-center p-6 bg-white">
                <div className="mb-5">
                    <Image src={chatGPTLogo} alt="ChatGPT" width={41} height={41} />
                </div>
                <div className="mb-2 text-center">欢迎使用问答机器人，使用ChatGPT 3.5模型</div>
                <div className="mb-4 text-center">请使用邮箱进行登录或者注册新账号</div>
                <div className="flex flex-row gap-3 w-full justify-center">
                    <Link href="/login">
                        <div className="btn relative btn-primary flex items-center justify-center h-10 text-white bg-btn-green rounded p-4">
                            登录
                        </div>
                    </Link>
                    <Link href="/auth/register">
                        <div className="btn relative btn-primary flex items-center justify-center h-10 text-white bg-btn-green rounded p-4">
                            注册
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
