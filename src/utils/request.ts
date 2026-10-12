import axios from 'axios';

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/',
  timeout: 30000,
});
service.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.token = token;
  return config;
});
service.interceptors.response.use((response) => {
  if (response.data?.code && response.data.code !== '200') {
    return Promise.reject(new Error(response.data.msg || '请求失败'));
  }
  return response;
}, (error) => Promise.reject(error));
export { service as axios };
