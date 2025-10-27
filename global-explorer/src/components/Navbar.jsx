import React from 'react';
import { Link } from 'react-router-dom';
// import { useDarkMode } from '../context/DarkModeContext'; // For Bonus

const Navbar = () => {
    // const { isDarkMode, toggleDarkMode } = useDarkMode(); // For Bonus

    return (
        <header className="sticky top-0 z-50 shadow-md bg-white dark:bg-gray-800 transition-colors duration-300">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                
                {/* Logo/App Name */}
                <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    🌎 Global Explorer
                </Link>

                {/* Navigation Links and Controls */}
                <div className="flex items-center space-x-6">
                    
                    {/* Home Link */}
                    <Link 
                        to="/" 
                        className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                    >
                        Countries
                    </Link>

                    {/* Favorites Link */}
                    <Link 
                        to="/favorites" 
                        className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                    >
                        ⭐️ Favorites
                    </Link>

                    {/* Dark Mode Toggle (Bonus Placeholder) */}
                    {/* <button 
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-yellow-400 transition-colors"
                    >
                        {isDarkMode ? '☀️' : '🌙'}
                    </button> */}
                </div>
            </nav>
        </header>
    );
};

export default Navbar;