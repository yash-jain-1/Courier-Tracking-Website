// src/api/axios.js
import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://courier-tracking-website.onrender.com/api'  // Updated to correct port 3001
});

export default instance;