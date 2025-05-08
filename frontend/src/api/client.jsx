import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:7001/',
  withCredentials: true
});

export default client;
