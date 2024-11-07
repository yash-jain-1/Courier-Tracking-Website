// src/api/axios.js
import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:3001'  // Updated to correct port 3001
});

export default instance;