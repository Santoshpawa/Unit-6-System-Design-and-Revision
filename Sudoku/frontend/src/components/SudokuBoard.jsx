import React, { useEffect, useState } from "react";

// Helper to deep clone
const clone = (a) => a.map((r) => [...r]);

export default function SudokuBoard({ puzzle, onCheck, isUnlocked }) {
  const emptyGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
  const [board, setBoard] = useState(emptyGrid);
  const [fixed, setFixed] = useState(emptyGrid.map((r) => r.map(() => false)));
  const [wrongMap, setWrongMap] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load puzzle data safely
  useEffect(() => {
    if (!puzzle || !Array.isArray(puzzle.start)) {
      setBoard(emptyGrid);
      setFixed(emptyGrid.map((r) => r.map(() => false)));
      setLoading(true);
      return;
    }

    setBoard(clone(puzzle.start));
    setFixed(puzzle.start.map((r) => r.map((v) => v !== 0)));
    setWrongMap(null);
    setLoading(false);
  }, [puzzle]);

  const setCell = (r, c, v) => {
    if (!board[r] || !fixed[r]) return;
    if (fixed[r][c]) return;
    const nb = clone(board);
    nb[r][c] = v;
    setBoard(nb);
  };

  const renderCell = (r, c) => {
    const val = board?.[r]?.[c] ?? 0;
    const isFixed = fixed?.[r]?.[c] ?? false;
    const wrong = wrongMap?.[r]?.[c] ?? false;

    // Create bold grid line classes every 3 rows/columns
    const borderClasses = `
      border border-gray-400
      ${r % 3 === 0 ? "border-t-4 border-t-black" : ""}
      ${c % 3 === 0 ? "border-l-4 border-l-black" : ""}
      ${r === 8 ? "border-b-4 border-b-black" : ""}
      ${c === 8 ? "border-r-4 border-r-black" : ""}
    `;

    return (
      <input
        key={`${r}-${c}`}
        type="text"
        maxLength="1"
        className={`w-10 h-10 text-center text-lg font-semibold focus:outline-none
          ${borderClasses}
          ${isFixed ? "bg-gray-200 text-black" : "bg-white text-blue-700"}
          ${wrong ? "bg-red-300" : ""}
          ${!isUnlocked ? "opacity-60 cursor-not-allowed" : ""}
        `}
        value={val === 0 ? "" : val}
        onChange={(e) => {
          const v = e.target.value.replace(/[^1-9]/g, "");
          setCell(r, c, v ? parseInt(v) : 0);
        }}
        disabled={!isUnlocked}
      />
    );
  };

  const computeWrongMap = (solution) => {
    const map = Array.from({ length: 9 }, () => Array(9).fill(false));
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) continue;
        if (board[r][c] !== solution[r][c]) map[r][c] = true;
      }
    }
    return map;
  };

  const handleCheck = async () => {
    if (!puzzle) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        (import.meta.env.VITE_API_BASE || "http://localhost:4000") +
          "/api/puzzles/check",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: puzzle.id, board }),
        }
      );
      const data = await res.json();

      if (data.correct) {
        setWrongMap(null);
        alert("✅ Correct! Puzzle solved.");
      } else {
        const globalSolutions = window.__SUDOKU_SOLUTIONS;
        if (globalSolutions && globalSolutions[puzzle.id]) {
          setWrongMap(computeWrongMap(globalSolutions[puzzle.id]));
        } else {
          setWrongMap(Array.from({ length: 9 }, () => Array(9).fill(false)));
          alert("❌ Incorrect. Wrong entries highlighted.");
        }
      }

      // 🔄 Notify app to refresh badges & puzzle unlocking
      if (data.solvedPuzzles || data.badges) {
        window.dispatchEvent(new CustomEvent("user-update", { detail: data }));
      }
    } catch (e) {
      alert("Check failed: " + e.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-gray-600 text-lg font-medium">
        Loading puzzle...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Sudoku Grid */}
      <div className="grid grid-cols-9 gap-0 shadow-lg rounded-lg overflow-hidden">
        {Array.from({ length: 9 }).map((_, r) =>
          Array.from({ length: 9 }).map((_, c) => renderCell(r, c))
        )}
      </div>

      {/* Check Button */}
      <button
        onClick={handleCheck}
        disabled={!isUnlocked}
        className={`px-6 py-2 rounded-md text-white font-semibold transition
          ${isUnlocked ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}
        `}
      >
        Check
      </button>
    </div>
  );
}
