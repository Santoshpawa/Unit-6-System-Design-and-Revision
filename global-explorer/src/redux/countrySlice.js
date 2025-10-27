import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 1. Create Async Thunk for Fetching All Countries
export const fetchCountries = createAsyncThunk(
  'countries/fetchCountries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,capital,region,population,area,flags,cca3,cca2');
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to load country data.');
    }
  }
);

const countrySlice = createSlice({
  name: 'countries',
  initialState: {
    list: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    filters: {
      region: 'All',
      sortBy: 'population', // 'population' or 'area'
      search: '',
    },
  },
  reducers: {
    // 2. Reducer for Filters & Sorting
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    // ... add more reducers if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload; // Store raw data
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setFilter } = countrySlice.actions;
export default countrySlice.reducer;