import React, { createContext, useState, useEffect } from 'react';

// Create the Theme Context
// It will hold the current theme ('light' or 'dark') and a function to toggle it.
export const ThemeContext = createContext({
    theme: 'light',
    toggleTheme: () => { },
});

// Create a Theme Provider component
// This component will wrap your application (or parts of it)
// and provide the theme state and toggle function to its children.
export const ThemeProvider = ({ children }) => {
    // State to hold the current theme.
    // Initialize from localStorage or default to 'light'.
    const [theme, setTheme] = useState(() => {
        // Check if a theme preference is stored in local storage
        const storedTheme = localStorage.getItem('app-theme');
        // If a theme is stored, use it; otherwise, default to 'light'
        return storedTheme ? storedTheme : 'light';
    });

    // Effect to apply the theme class to the document body
    // and save the theme preference to localStorage.
    // This helps apply CSS variables defined in App.css
    useEffect(() => {
        document.body.className = theme; // Apply the theme class ('light' or 'dark') to the body
        localStorage.setItem('app-theme', theme); // Save theme preference for persistence
    }, [theme]); // This effect re-runs whenever the 'theme' state changes

    // Function to toggle between 'light' and 'dark' themes
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // The value prop of the Provider makes the 'theme' state and 'toggleTheme' function
    // available to any descendant component that consumes this context using useContext.
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
