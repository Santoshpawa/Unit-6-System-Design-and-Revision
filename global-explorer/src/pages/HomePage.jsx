import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCountries, setFilter } from '../redux/countrySlice';
import CountryCard from '../components/CountryCard';
import FilterControls from '../components/FilterControls';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const HomePage = () => {
  const dispatch = useDispatch();
  const { list, status, error, filters } = useSelector((state) => state.countries);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Pagination size

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCountries());
    }
  }, [status, dispatch]);

  // Combined Filtering, Searching, and Sorting Logic (Requirement 3 & Bonus)
  const processedCountries = useMemo(() => {
    // FIX: Create a shallow copy of the list before using the mutable .sort() method
    let filtered = [...list]; 

    // 1. Filter by Region
    if (filters.region !== 'All') {
      filtered = filtered.filter(c => c.region === filters.region);
    }

    // 2. Search by Name/Capital (Bonus)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.common.toLowerCase().includes(searchLower) ||
        (c.capital && c.capital[0].toLowerCase().includes(searchLower))
      );
    }

    // 3. Sort
    filtered.sort((a, b) => {
      // Ensure the required fields (population, area) were included in the minimal API fetch.
      const valA = filters.sortBy === 'population' ? a.population : a.area || 0;
      const valB = filters.sortBy === 'population' ? b.population : b.area || 0;
      return valB - valA; // Descending order
    });

    return filtered;
  }, [list, filters]);

  // 4. Pagination
  const totalPages = Math.ceil(processedCountries.length / itemsPerPage);
  const paginatedCountries = processedCountries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset pagination if filters/sorting significantly change the list length
  useEffect(() => {
      setCurrentPage(1);
  }, [filters]);


  if (status === 'loading') return <LoadingSpinner />;
  if (status === 'failed') return <ErrorMessage message={error} />;
  
  // Handle case where filters yield no results
  if (status === 'succeeded' && processedCountries.length === 0) {
      return (
          <div className="p-8">
              <h1 className="text-3xl font-bold mb-6">Global Country Explorer</h1>
              <FilterControls filters={filters} setFilter={(payload) => dispatch(setFilter(payload))} />
              <p className="mt-8 text-center text-gray-500">No countries match your current filters and search criteria.</p>
          </div>
      );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Global Country Explorer</h1>
      <FilterControls filters={filters} setFilter={(payload) => dispatch(setFilter(payload))} />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedCountries.map((country) => (
          <CountryCard key={country.name.common} country={country} />
        ))}
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default HomePage;