import React from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleFavorite } from "../redux/favoriteSlice";
// Assume you'll implement the weather fetching for the mini card here (Bonus)

const CountryCard = ({ country }) => {
  const dispatch = useDispatch();
  const isFavorite = useSelector(
    (state) => state.favorites[country.name.common]
  );

  const handleToggleFavorite = (e) => {
    e.preventDefault(); // Stop navigation to details page
    dispatch(toggleFavorite(country.name.common));
  };

  return (
    <Link
      to={`/country/${country.name.common}`}
      className="rounded-lg overflow-hidden transition-shadow hover:shadow-xl"
    >
      <div className="h-40 bg-gray-100">
        <img
          src={country.flags.svg}
          alt={`${country.name.common} flag`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="">
          <h2 className="text-xl font-semibold mb-1">{country.name.common}</h2>
          <button onClick={handleToggleFavorite} className="text-2xl">
            {isFavorite ? "⭐️" : "☆"} {/* Favorite Star */}
          </button>
        </div>
        <p>
          Capital:{" "}
          <span className="font-medium">{country.capital?.[0] || "N/A"}</span>
        </p>
        <p>
          Region: <span>{country.region}</span>
        </p>
        <p>
          Population: <span>{country.population.toLocaleString()}</span>
        </p>
        {/* Bonus: Mini Weather Icon/Temp goes here */}
      </div>
    </Link>
  );
};

export default CountryCard;
