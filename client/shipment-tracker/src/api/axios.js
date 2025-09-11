// src/api/axios.js
import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://courier-tracking-website.onrender.com/api', // Use environment variable for base URL
});

export default instance;