// src/api/axios.js
import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE, // Use environment variable for base URL
});

export default instance;