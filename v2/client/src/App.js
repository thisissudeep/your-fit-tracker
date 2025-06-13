import React, { useContext, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeContext } from './context/ThemeContext';
import DashboardPage from './pages/DashboardPage';
import WorkoutTrackerPage from './pages/WorkoutTrackerPage';
import AICounterPage from './pages/AICounterPage';
import './App.css'; // Global styles and theme definitions

// Image imports (relative to src/)
import dashboardBg from './assets/dashboard-bg.jpg';
import trackerBg from './assets/tracker-bg.jpg';
import aiCounterBg from './assets/ai-counter-bg.jpg';

function App() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();

  useEffect(() => {
    let backgroundImage = '';
    if (location.pathname === '/') {
      backgroundImage = `url(${dashboardBg})`;
    } else if (location.pathname === '/track') {
      backgroundImage = `url(${trackerBg})`;
    } else if (location.pathname === '/ai-counter') {
      backgroundImage = `url(${aiCounterBg})`;
    }
    document.body.style.backgroundImage = backgroundImage;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center center';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundRepeat = 'no-repeat';

    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundAttachment = '';
      document.body.style.backgroundRepeat = '';
    };
  }, [location.pathname]);

  return (
    <div className="App">
      <header className="app-header">
        {/* New brand title */}
        <div className="brand-title">Your Fit Tracker</div>

        <nav className="main-nav">
          <Link to="/" className="nav-link"><b>Dashboard</b></Link>
          <Link to="/track" className="nav-link"><b>Workout Tracker</b></Link>
          <Link to="/ai-counter" className="nav-link"><b>AI Counter</b></Link>
        </nav>
        <button onClick={toggleTheme} className="theme-toggle-button">
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </header>

      <main className="app-main-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/track" element={<WorkoutTrackerPage />} />
          <Route path="/ai-counter" element={<AICounterPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;