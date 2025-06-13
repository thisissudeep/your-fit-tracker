import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Keep the default index.css for global base styles
import App from './App';
import { ThemeProvider } from './context/ThemeContext'; // Import ThemeProvider
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Wrap the entire application with BrowserRouter */}
    <Router>
      {/* Then wrap with ThemeProvider */}
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Router>
  </React.StrictMode>
);
