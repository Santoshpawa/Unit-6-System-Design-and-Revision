import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useSelector } from 'react-redux';

// Replace with your actual API keys
const OPENWEATHER_API_KEY = 'YOUR_OPENWEATHER_API_KEY';
const NEWS_API_KEY = 'YOUR_NEWS_API_KEY';

// ===============================================
// Component for fetching and displaying Weather
// ===============================================
const WeatherDisplay = ({ capital }) => {
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    // 1. Check if capital is available
    if (!capital) {
        setStatus('failed'); // No capital to search for weather
        return;
    }
    
    // 2. Fetch Weather Data (using the capital prop)
    setStatus('loading');
    // Ensure you use your OPENWEATHER_API_KEY here
    axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=${OPENWEATHER_API_KEY}&units=metric`)
      .then(res => {
        setWeather(res.data);
        setStatus('succeeded');
      })
      .catch((error) => {
        console.error("Weather API Error:", error);
        setWeather(null); 
        setStatus('failed');
      });
  }, [capital]); // ⬅️ DEPENDS ONLY on 'capital' prop

  if (status === 'loading') return <p>Loading weather...</p>;
  if (status === 'failed' || !weather) return <p className="text-red-500">Weather data unavailable.</p>;

  return (
    <div className="border p-4 rounded-lg bg-blue-50">
      <h3 className="text-xl font-semibold mb-2">Current Weather in {capital}</h3>
      <p>Temperature: <span className="font-bold">{weather.main.temp}°C</span></p>
      <p>Condition: {weather.weather[0].description}</p>
      <p>Humidity: {weather.main.humidity}%</p>
    </div>
  );
};

// ===============================================
// Component for fetching and displaying News
// ===============================================
const NewsDisplay = ({ countryCode }) => {
  const [news, setNews] = useState([]);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!countryCode) return;
    setStatus('loading');
    // Note: NewsAPI typically uses a 2-letter country code (e.g., 'us', 'in')
    axios.get(`https://newsapi.org/v2/top-headlines?country=${countryCode.toLowerCase()}&pageSize=3&apiKey=${NEWS_API_KEY}`)
      .then(res => {
        setNews(res.data.articles);
        setStatus('succeeded');
      })
      .catch(() => setStatus('failed'));
  }, [countryCode]);

  if (status === 'loading') return <p>Loading news...</p>;
  if (status === 'failed' || news.length === 0) return <p className="text-red-500">Top news unavailable.</p>;

  return (
    <div className="border p-4 rounded-lg bg-gray-100">
      <h3 className="text-xl font-semibold mb-2">Top 3 Headlines</h3>
      <ul className="list-disc list-inside">
        {news.map((item, index) => (
          <li key={index} className="mb-1">
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ===============================================
// Main CountryDetails Component
// ===============================================
const CountryDetails = () => {
  // Get country name from URL parameters
  const { countryName } = useParams();
  
  // Local state for full country details fetched here
  const [countryDetails, setCountryDetails] = useState(null);
  const [status, setStatus] = useState('idle');
  
  // Access full list from Redux for border linking
  const allCountries = useSelector(state => state.countries.list);

  useEffect(() => {
    setStatus('loading');
    // Fetch detailed data for the specific country using the full name
    // This endpoint should return ALL fields without the ?fields= query
    axios.get(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`)
      .then(res => {
        setCountryDetails(res.data[0]);
        setStatus('succeeded');
      })
      .catch(() => {
        setStatus('failed');
      });
  }, [countryName]);

  if (status === 'loading') return <LoadingSpinner />;
  if (status === 'failed' || !countryDetails) return <ErrorMessage message="Failed to load country details." />;

  // Helper function to render languages and currencies
  const formatList = (obj) => {
    if (!obj) return 'N/A';
    // Use optional chaining inside map in case of varied object structures
    return Object.values(obj).map(item => item.name || item.symbol || item).join(', ');
  };

  // Find neighbor country names for linking (Requirement 2)
  const getBorderName = (cca3) => {
    const neighbor = allCountries.find(c => c.cca3 === cca3);
    return neighbor ? neighbor.name.common : cca3;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link to="/" className="text-blue-500 hover:underline mb-4 block">← Back to Home</Link>
      <h1 className="text-4xl font-extrabold mb-8">{countryDetails.name.official}</h1>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Left: Flag and Details */}
        <div>
          <img 
            src={countryDetails.flags.svg} 
            alt={`${countryDetails.name.common} flag`} 
            className="w-full h-auto border shadow-xl mb-6"
          />
          <p className="text-lg"><strong>Capital:</strong> {countryDetails.capital?.[0] || 'N/A'}</p>
          <p className="text-lg"><strong>Region:</strong> {countryDetails.region}</p>
          {/* Safe access for population */}
          <p className="text-lg"><strong>Population:</strong> {countryDetails.population ? countryDetails.population.toLocaleString() : 'N/A'}</p> 
          <p className="text-lg"><strong>Languages:</strong> {formatList(countryDetails.languages)}</p>
          <p className="text-lg"><strong>Currencies:</strong> {formatList(countryDetails.currencies)}</p>
          <p className="text-lg mt-4">
            <strong>Borders:</strong>
            {countryDetails.borders && countryDetails.borders.length > 0 ? (
                <span className="ml-2 flex flex-wrap gap-2">
                    {countryDetails.borders.map((cca3) => (
                        // Link neighboring countries
                        <Link key={cca3} to={`/country/${getBorderName(cca3)}`} className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300">
                            {getBorderName(cca3)}
                        </Link>
                    ))}
                </span>
            ) : (
                <span className="ml-2">None</span>
            )}
          </p>
        </div>

        {/* Right: Map, Weather, News */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Location & External Data</h2>
          
          {/* Map Location Link */}
          {countryDetails.latlng && (
            <div className="mb-6">
                <a 
                    href={`http://maps.google.com/maps?q=${countryDetails.latlng[0]},${countryDetails.latlng[1]}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                >
                    View on Map (Lat: {countryDetails.latlng[0]}, Lng: {countryDetails.latlng[1]})
                </a>
                <div className="h-48 bg-gray-200 mt-2 flex items-center justify-center text-sm text-gray-500">
                    Map Placeholder
                </div>
            </div>
          )}

          {/* Weather Component */}
          <WeatherDisplay capital={countryDetails.capital?.[0]} />
          
          {/* News Component */}
          <div className="mt-6">
            <NewsDisplay countryCode={countryDetails.cca2} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryDetails;