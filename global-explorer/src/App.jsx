import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import HomePage from './pages/HomePage';
import CountryDetails from './pages/CountryDetails';
import FavoritesPage from './pages/FavoritesPage';
import Navbar from './components/Navbar';
// Assume you'll implement a DarkModeProvider for the bonus

function App() {
  return (
    <Provider store={store}>
      <Router>
        {/* <DarkModeProvider> (For Bonus) */}
          <Navbar />
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/country/:countryName" element={<CountryDetails />} />
              <Route path="*" element={<HomePage />} /> {/* Fallback */}
            </Routes>
          </div>
        {/* </DarkModeProvider> */}
      </Router>
    </Provider>
  );
}

export default App;