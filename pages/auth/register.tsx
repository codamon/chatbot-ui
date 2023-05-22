import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/router';
import {loginWithEmail, registerWithEmail} from "../api/auth";
import chatGPTLogo from "../../public/chatgpt.jpeg";
import Image from "next/image";
import ReCAPTCHA from "react-google-recaptcha";

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [isValidEmail, setIsValidEmail] = useState(true);
    const [isRegisteredEmail, setIsRegisteredEmail] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [remember, setRemember] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [isValidPhoneNumber, setIsValidPhoneNumber] = useState(true);
    const [inviteCode, setInviteCode] = useState("");
    const [isValidInviteCode, setIsValidInviteCode] = useState(true);
    const [recaptchaResponse, setRecaptchaResponse] = useState(null);

    const router = useRouter();

    const validateEmail = (email: string) => {
        const regex = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
        return regex.test(email);
    };

    const checkEmailRegistered = async (email: string) => {
        // replace with your actual API call to check if email is registered
        // it should return a Promise<boolean>
    };

    const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        setIsValidEmail(validateEmail(newEmail));
        if (isValidEmail) {
            // setIsRegisteredEmail(await checkEmailRegistered(newEmail));
        }
    };

    const handleSendCode = () => {
        if (!isValidPhoneNumber) {
            alert("请输入有效的中国大陆手机号码!");
            return;
        }

        // 这里你可以处理发送验证码的逻辑，例如发送请求到后端API
        console.log("Sending verification code to: ", phoneNumber);
    };

    // 验证手机号码的方法
    const validatePhoneNumber = (number: string) => {
        // 验证中国大陆手机号码的正则表达式
        const phoneReg = /^1[3456789]\d{9}$/;
        return phoneReg.test(number);
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPhoneNumber = e.target.value;

        // 检查新的电话号码是否只包含数字
        if (!/^\d*$/.test(newPhoneNumber)) {
            // 如果包含非数字字符，就不更新 phoneNumber 状态，并退出函数
            return;
        }

        setPhoneNumber(newPhoneNumber);
        setIsValidPhoneNumber(validatePhoneNumber(newPhoneNumber));
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        try {
            const response = await registerWithEmail(email, password, passwordConfirmation, inviteCode,);

            // 如果登录成功，跳转到邮件确认页面
            await router.push('/auth/RegistrationSuccess');
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    const validateInviteCode = (code: string) => {
        const regex = /^[A-Za-z0-9]{6}$/;
        return regex.test(code);
    };

    const handleInviteCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newInviteCode = e.target.value;
        setInviteCode(newInviteCode);
        setIsValidInviteCode(validateInviteCode(newInviteCode));
    };

    const handleRecaptcha = (response: any) => {
        setRecaptchaResponse(response);
    };


    return (
        <div
            className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div
                    className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-sm-3xl sm:p-10">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center space-x-5">
                            <Image src={chatGPTLogo} alt="ChatGPT" width={60}
                                   height={60}/>
                            <div
                                className="text-center text-2xl font-semibold text-gray-900">注册
                            </div>
                        </div>
                        {error && (
                            <div className="text-red-500 py-2">{error}</div>
                        )}
                        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                            <div className="relative flex flex-col">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    required
                                    placeholder="邮箱"
                                    className={`border ${isValidEmail ? (isRegisteredEmail ? 'border-red-500' : 'border-gray-200') : 'border-red-500'} p-3 rounded-sm mt-1 focus:outline-none focus:border-blue-500 h-10`}
                                />
                                {!isValidEmail && <span
                                  className="text-red-500">请输入有效的邮箱地址</span>}
                                {isValidEmail && isRegisteredEmail && <span
                                  className="text-red-500">此邮箱已经注册</span>}
                            </div>
                            {/*<div className="relative flex flex-row">*/}
                            {/*    <input*/}
                            {/*        id="phoneNumber"*/}
                            {/*        name="phoneNumber"*/}
                            {/*        type="tel"*/}
                            {/*        value={phoneNumber}*/}
                            {/*        required*/}
                            {/*        placeholder="手机号码"*/}
                            {/*        onChange={handlePhoneNumberChange}*/}
                            {/*        className={`border ${isValidPhoneNumber ? 'border-gray-200' : 'border-red-500'} h-10 p-3 rounded-sm-sm mt-1 focus:outline-none focus:border-blue-500 mr-4`}*/}
                            {/*    />*/}
                            {/*    <button onClick={handleSendCode}*/}
                            {/*            className="btn relative btn-primary flex h-10 items-center justify-center h-10 mt-1 text-white text-sm bg-btn-green rounded-sm-sm px-4">*/}
                            {/*        发送*/}
                            {/*    </button>*/}
                            {/*</div>*/}
                            {/*{!isValidPhoneNumber && <span*/}
                            {/*<div className="relative">*/}
                            {/*    <input*/}
                            {/*        id="verificationCode"*/}
                            {/*        name="verificationCode"*/}
                            {/*        type="text"*/}
                            {/*        value={verificationCode}*/}
                            {/*        onChange={(e) => setVerificationCode(e.target.value)}*/}
                            {/*        required*/}
                            {/*        placeholder="验证码"*/}
                            {/*        className="w-full border border-gray-200 p-3 rounded-sm mt-1 focus:outline-none focus:border-blue-500 h-10 text-sm"*/}
                            {/*    />*/}
                            {/*</div>*/}
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="密码"
                                    className="w-full border border-gray-200 p-3 rounded-sm mt-1 focus:outline-none focus:border-blue-500 h-10 text-sm"
                                />
                            </div>
                            <div className="relative">
                                <input
                                    id="passwordConfirmation"
                                    name="passwordConfirmation"
                                    type="password"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    required
                                    placeholder="重复密码"
                                    className="w-full border border-gray-200 p-3 rounded-sm mt-1 focus:outline-none focus:border-blue-500 h-10 text-sm"
                                />
                            </div>
                            <div>
                                <div
                                    className="relative flex flex-row items-center">
                                    <input
                                        id="inviteCode"
                                        name="inviteCode"
                                        type="text"
                                        value={inviteCode}
                                        onChange={handleInviteCodeChange}
                                        placeholder="邀请码"
                                        className={`border ${isValidInviteCode ? 'border-gray-200' : 'border-red-500'} h-10 p-3 rounded-sm-sm mt-1 focus:outline-none focus:border-blue-500 mr-4`}
                                    />
                                    {!isValidInviteCode && <span
                                      className="text-red-500">请输入有效的邀请码（六位字母或数字的组合）</span>}
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-sm-md shadow-sm text-base h-10 font-medium text-white bg-btn-green hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
                            >
                                登录
                            </button>
                            <ReCAPTCHA
                                sitekey="6LfEa0MUAAAAAKM8FPkXHfjvFIbO6UlSxNWlYGHp"
                                onChange={handleRecaptcha}
                                size={'compact'}
                            />
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default LoginPage;
