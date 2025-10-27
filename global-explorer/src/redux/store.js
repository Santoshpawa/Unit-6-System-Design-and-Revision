import { configureStore } from '@reduxjs/toolkit';
import countryReducer from './countrySlice';
import favoriteReducer from './favoriteSlice';

const store = configureStore({
  reducer: {
    countries: countryReducer,
    favorites: favoriteReducer,
  },
});

export default store;