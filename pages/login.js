import React, { useState } from 'react';
import { useRouter } from 'next/router';
import apiClient from "../utils/app/apiClient";
import { AxiosResponse } from "axios";
import { loginWithEmail } from "./api/auth";
import chatGPTLogo from "../public/chatgpt.jpeg";
import Image from "next/image";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginWithEmail(email, password, remember);
      // localStorage.setItem('access_token', response.data.access_token);

      // Redirect to the desired page after successful login
      // 如果登录成功，跳转到首页
      await router.push('/');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  const onRememberClick = () => {
    setRemember(!remember);
  }

  return (
    <div
      className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div
          className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center space-x-5">
              <Image src={chatGPTLogo} alt="ChatGPT" width={60} height={60} />
              <div
                className="text-center text-2xl font-semibold text-gray-900">问答机器人登录
              </div>
            </div>
            {error && (
              <div className="text-red-500 py-2">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <input type="hidden" name="remember" value="true"/>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="邮箱"
                  className="w-full border border-gray-200 p-3 rounded mt-1 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="密码"
                  className="w-full border border-gray-200 p-3 rounded mt-1 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-xl font-medium text-white bg-btn-green hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
              >
                登录
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
};

export default LoginPage;
