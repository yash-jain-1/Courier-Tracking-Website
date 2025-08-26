import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import AdminDashboard from './pages/AdminDashboard';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import TrackShipment from './pages/TrackShipment';

const isAuthenticated = () => !!localStorage.getItem('token');

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Box minH="100vh" bg="gray.50">
        <Navbar />
        <Box>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/track" element={<TrackShipment />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

export default App;