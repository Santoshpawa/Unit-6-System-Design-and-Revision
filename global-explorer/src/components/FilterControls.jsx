import React from 'react';

const regions = ["All", "Africa", "Americas", "Asia", "Europe", "Oceania"];
const sortOptions = [
    { value: 'population', label: 'Population (High to Low)' },
    { value: 'area', label: 'Area (Large to Small)' }
];

const FilterControls = ({ filters, setFilter }) => {
    const handleSearchChange = (e) => {
        setFilter({ search: e.target.value });
    };

    const handleRegionChange = (e) => {
        setFilter({ region: e.target.value });
    };

    const handleSortChange = (e) => {
        setFilter({ sortBy: e.target.value });
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner">
            
            {/* Search Input */}
            <input
                type="text"
                placeholder="Search by country or capital..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full md:w-1/3 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            />

            {/* Region Filter Dropdown */}
            <select
                value={filters.region}
                onChange={handleRegionChange}
                className="w-full md:w-1/3 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            >
                {regions.map(region => (
                    <option key={region} value={region}>Filter by {region}</option>
                ))}
            </select>

            {/* Sort Dropdown */}
            <select
                value={filters.sortBy}
                onChange={handleSortChange}
                className="w-full md:w-1/3 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            >
                {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );
};

export default FilterControls;