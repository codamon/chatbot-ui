import apiClient from "../../utils/app/apiClient";

/**
 * 使用邮箱登录
 */
export const loginWithEmail = async (email: string, password: string, remember: boolean) => {

  const response = await apiClient.post('/auth/login', { email, password, remember });
  localStorage.setItem('access_token', response.data.access_token);
  return response.data.data;
};

export const registerWithEmail = async (email: string, password: string, passwordConfirmation: string, inviteCode: string) => {
  const response = await apiClient.post('/auth/register', { email, password, 'password_confirmation': passwordConfirmation, 'invite_token':inviteCode });
  return response.data.data;
}

export const verifyPhone = async (phone: string, code: string) => {
    const response = await apiClient.post('/auth/verify-phone', { phone, code });
    return response.data.data;
}

export const verifyEmail = async (email: string, code: string) => {
    const response = await apiClient.post('/auth/verify-email', { email, code });
    return response.data.data;
}
