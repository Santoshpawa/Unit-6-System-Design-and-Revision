import { createSlice } from '@reduxjs/toolkit';

// Function to load favorites from localStorage
const loadFavorites = () => {
  try {
    const serializedState = localStorage.getItem('globalExplorerFavorites');
    return serializedState ? JSON.parse(serializedState) : {};
  } catch (e) {
    console.warn("Could not load favorites from local storage", e);
    return {};
  }
};

// Function to save favorites to localStorage
const saveFavorites = (favorites) => {
  try {
    const serializedState = JSON.stringify(favorites);
    localStorage.setItem('globalExplorerFavorites', serializedState);
  } catch (e) {
    console.error("Could not save favorites to local storage", e);
  }
};

const favoriteSlice = createSlice({
  name: 'favorites',
  initialState: loadFavorites(), // Load on startup
  reducers: {
    toggleFavorite: (state, action) => {
      const countryName = action.payload;
      if (state[countryName]) {
        delete state[countryName];
      } else {
        // Store basic info needed for the Favorites tab
        state[countryName] = { name: countryName, addedAt: Date.now() }; 
      }
      saveFavorites(state); // Persist change
    },
  },
});

export const { toggleFavorite } = favoriteSlice.actions;
export default favoriteSlice.reducer;