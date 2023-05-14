import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse
} from 'axios';
import {log} from "util";

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
    _retry?: boolean;
}

const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器：在请求发送之前处理
apiClient.interceptors.request.use(
    // @ts-ignore
    (config: AxiosRequestConfig) => {
        const accessToken = localStorage.getItem('access_token');
        console.log('--24:', accessToken);
        if (accessToken) {
            // @ts-ignore
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    },
);

// 响应拦截器：在收到响应之前处理
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // 正常响应，直接返回(不做任何处理)
        // 判断一下响应中是否有 token，如果有就直接使用此 token 替换掉本地的 token。你可以根据你的业务需求自己编写更新 token 的逻辑
        const token = response.headers.authorization;
        if (token) {
            // 如果 header 中存在 token，那么触发 refreshToken 方法，替换本地的 token
            localStorage.setItem('access_token', token);
        }
        return response;
    },
    async (error: AxiosError) => {
        // 如果响应为 401（未授权），尝试刷新 access_token

        switch (error.response?.status) {
            // 如果响应中的 http code 为 401，那么则此用户可能 token 失效了之类的，我会触发 logout 方法，清除本地的数据并将用户重定向至登录页面
            case 401:
                console.log('刷新令牌失败，清除存储并跳转到登录页面');
                // 刷新令牌失败，清除存储并跳转到登录页面
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                // 重定向到登录页面
                window.location.href = '/login';
                break;
            // 如果响应中的 http code 为 400，那么就弹出一条错误提示给用户
            case 400:
                console.error('400 error'); // 你可以根据你的应用替换这里的错误处理逻辑
                break;
        }
        return Promise.reject(error);
    },
);

export default apiClient;
