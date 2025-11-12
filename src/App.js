import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StampPage from './pages/StampPage';
import FormTestPage from './pages/FormTestPage';
import './App.css';


function App() {
return (
<Router>
<Routes>
<Route path="/" element={<HomePage />} />
<Route path="/stamps" element={<StampPage />} />
<Route path="/test-form" element={<FormTestPage />} />
</Routes>
</Router>
);
}


export default App;