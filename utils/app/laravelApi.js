import axios from 'axios';

const api = axios.create({
  baseURL: 'http://your-laravel-api-url.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
