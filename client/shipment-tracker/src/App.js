// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import NavBar from './components/Navbar';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import AdminDashboard from './pages/AdminDashboard';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';

const isAuthenticated = () => !!localStorage.getItem('token'); // Check if token is in local storage

const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
};


const App = () => {
  return (
    <Router>
      <div className="App">
        <NavBar />
        
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
