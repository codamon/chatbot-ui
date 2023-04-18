// utils/api/sendRequest.ts

export interface RequestOptions {
    method: string;
    headers?: HeadersInit;
    body?: string;
    timeout?: number;
}

export async function sendRequest(
    url: string,
    options: RequestOptions
): Promise<Response> {
    const controller = new AbortController();
    const signal = controller.signal;

    // 设置请求超时
    if (options.timeout) {
        setTimeout(() => controller.abort(), options.timeout);
    }

    try {
        const response = await fetch(url, {
            ...options,
            signal,
        });

        // 检查响应状态
        if (!response.ok) {
            throw new Error(`请求失败，状态码：${response.status}`);
        }

        return response;
    } catch (error) {
        // 处理网络请求错误
        if ((error as Error).name === 'AbortError') {
            throw new Error('请求超时');
        }

        throw error;
    }
}
