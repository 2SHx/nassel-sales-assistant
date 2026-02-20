import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SearchProjects from './pages/SearchProjects';
import SalesHub from './pages/SalesHub';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/search" element={<SearchProjects />} />
                <Route path="/map" element={<SalesHub />} />
            </Routes>
        </Router>
    );
};

export default App;
