import React from 'react';
import { useSelector } from 'react-redux';
import CountryCard from '../components/CountryCard';

const FavoritesPage = () => {
  const allCountries = useSelector(state => state.countries.list);
  const favorites = useSelector(state => state.favorites);

  // Get the full country objects for the favorites
  const favoriteCountries = allCountries.filter(country => 
    favorites[country.name.common]
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Your Favorite Countries</h1>
      
      {favoriteCountries.length === 0 ? (
        <p className="text-gray-500">You haven't added any favorites yet. Go explore!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteCountries.map((country) => (
            // Re-use the existing CountryCard component
            <CountryCard key={country.name.common} country={country} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;