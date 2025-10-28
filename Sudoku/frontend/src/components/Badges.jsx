import React from "react";

export default function Badges({ badges }) {
  return (
    <div className="flex flex-wrap gap-3 mt-4 justify-center">
      {(!badges || badges.length === 0) ? (
        <div className="text-gray-500 italic text-sm">No badges yet 🏷️</div>
      ) : (
        badges.map((b, i) => (
          <div key={i} className="w-16 h-16 rounded-full overflow-hidden shadow-lg border-2 border-indigo-400">
            <img
              src={b}
              alt={`Badge ${i + 1}`}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
            />
          </div>
        ))
      )}
    </div>
  );
}
