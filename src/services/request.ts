import axios from 'axios';

// 腾讯云 serverless，
const request = axios.create({
  baseURL: 'https://service-fxf0odwp-1252010818.sh.apigw.tencentcs.com',
  timeout: 5000,
});

export default request;