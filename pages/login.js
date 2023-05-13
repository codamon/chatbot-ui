import React, { useState } from 'react';
import { useRouter } from 'next/router';
import apiClient from "../utils/app/apiClient";
import { AxiosResponse } from "axios";
import { loginWithEmail } from "./api/login";

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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-14 w-14 rounded-full p-2 border border-blue-300 text-blue-500"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path
                  d="M12 22v-4m6-10h-1a5 5 0 0 0-5-5V2a10 10 0 0 1 10 10h-4z"/>
              </svg>
              <div
                className="text-center text-2xl font-semibold text-gray-900">Login
              </div>
            </div>
            {error && (
              <div className="text-red-500 py-2">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <input type="hidden" name="remember" value="true"/>
              <div className="relative">
                <label htmlFor="email"
                       className="text-sm font-semibold text-gray-500">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-200 p-3 rounded mt-1 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="relative">
                <label htmlFor="password"
                       className="text-sm font-semibold text-gray-500">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-gray-200 p-3 rounded mt-1 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/*<div className="flex items-center justify-between">*/}
              {/*  <div className="flex items-center">*/}
              {/*    <input*/}
              {/*      id="remember_me"*/}
              {/*      name="remember_me"*/}
              {/*      type="checkbox"*/}
              {/*      className="h-4 w-4 bg-blue-500 focus:ring-blue-400 border-gray-300 rounded"*/}
              {/*      onClick={() => onRememberClick}*/}
              {/*    />*/}
              {/*    <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-800">*/}
              {/*      Remember me*/}
              {/*    </label>*/}
              {/*  </div>*/}
              {/*  <div className="text-sm">*/}
              {/*    <a href="#" className="font-medium text-blue-500 hover:text-blue-600">*/}
              {/*      Forgot your password?*/}
              {/*    </a>*/}
              {/*  </div>*/}
              {/*</div>*/}

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
};

export default LoginPage;
