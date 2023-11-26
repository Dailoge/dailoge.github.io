import axios from 'axios';

export const request = axios.create({
  baseURL: 'https://www.iwencai.com',
  timeout: 1000,
});
