import apiClient from "../../utils/app/apiClient";

/**
 * 使用邮箱登录
 */
export const loginWithEmail = async (email: string, password: string, remember: boolean) => {

  const response = await apiClient.post('/auth/login', { email, password, remember });
  localStorage.setItem('access_token', response.data.access_token);
  return response.data.data;
};
