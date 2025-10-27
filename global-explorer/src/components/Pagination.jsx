import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    // Determine which page numbers to show (e.g., current, and a few around it)
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5; // Show a maximum of 5 page numbers (e.g., 1, ..., 4, 5, 6, ...)
        
        // Always show first page
        if (totalPages > 0) pages.push(1);

        let start = Math.max(2, currentPage - Math.floor(maxVisible / 2) + 1);
        let end = Math.min(totalPages - 1, currentPage + Math.floor(maxVisible / 2));

        if (start > 2) pages.push('...'); // Ellipsis after 1

        for (let i = start; i <= end; i++) {
            if (i !== 1 && i !== totalPages) {
                pages.push(i);
            }
        }
        
        if (end < totalPages - 1) pages.push('...'); // Ellipsis before last

        // Always show last page (if totalPages > 1 and not already included)
        if (totalPages > 1 && pages[pages.length - 1] !== totalPages) {
             pages.push(totalPages);
        }
        
        // Cleanup: remove duplicate '...' and ensure page 1 is not followed immediately by '...' if page 2 is included
        return pages.filter((val, index, self) => val !== '...' || self[index - 1] !== '...');
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex justify-center items-center space-x-2 mt-8">
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
                Previous
            </button>

            {/* Page Numbers */}
            {pageNumbers.map((number, index) => (
                <React.Fragment key={index}>
                    {number === '...' ? (
                        <span className="px-3 py-2 text-gray-500">...</span>
                    ) : (
                        <button
                            onClick={() => onPageChange(number)}
                            className={`px-3 py-2 rounded-lg transition-colors 
                                ${number === currentPage 
                                    ? 'bg-blue-600 text-white font-bold' 
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600'
                                }`}
                        >
                            {number}
                        </button>
                    )}
                </React.Fragment>
            ))}

            {/* Next Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-2 border rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;