import React from 'react';

const ErrorMessage = ({ message }) => {
  return (
    <div className="flex justify-center items-center h-64 p-4">
      <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900 dark:border-red-600 dark:text-red-300 px-4 py-3 rounded relative shadow-lg" role="alert">
        <strong className="font-bold mr-2">Error!</strong>
        <span className="block sm:inline">{message || "Failed to fetch data. Please try refreshing the page."}</span>
      </div>
    </div>
  );
};

export default ErrorMessage;