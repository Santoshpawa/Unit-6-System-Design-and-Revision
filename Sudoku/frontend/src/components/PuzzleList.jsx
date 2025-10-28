import React, { useState, useEffect } from "react";
import SudokuBoard from "./SudokuBoard";
import api from "../services/api";

export default function PuzzleList({ puzzles, user, onChecked }) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (puzzles.length > 0 && active === null) {
      setActive(puzzles[0].id);
    }
  }, [puzzles]);

  function isUnlocked(puzzleId) {
    if (!user) return false;
    if (!user.solvedPuzzles) return puzzleId === puzzles[0]?.id; // only first unlocked

    const solved = user.solvedPuzzles;
    const idNum = Number(puzzleId);
    const prevId = (idNum - 1).toString();

    if (puzzleId === puzzles[0]?.id) return true;

    if (!Array.isArray(solved) && typeof solved === "object") {
      return solved[prevId] === true;
    }

    if (Array.isArray(solved)) {
      return solved[idNum - 1] === true;
    }

    return false;
  }

async function handleCheck(id, board, markWrong) {
  try {
    const resp = await api.post("/puzzles/check", {
      id,
      board,
      userId: user?._id, // 👈 include user ID
    });

    if (resp.correct) {
      onChecked(resp);
      alert("✅ Puzzle correct — marked solved and badges updated if any");
    } else {
      onChecked(resp);
      alert("❌ Puzzle incorrect — wrong entries highlighted");
    }
  } catch (e) {
    alert("Error: " + e.message);
  }
}


  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 bg-gray-50 min-h-screen">
      {/* Puzzle list sidebar */}
      <div className="flex flex-col items-start gap-3 bg-white p-4 rounded-xl shadow-md w-full md:w-64">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">🧩 Puzzles</h2>
        <div className="flex flex-wrap md:flex-col gap-3">
          {puzzles.map((p) => {
            const unlocked = isUnlocked(p.id);
            const isActive = p.id === active;
            return (
              <button
                key={p.id}
                disabled={!unlocked}
                onClick={() => unlocked && setActive(p.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border text-sm 
                  ${
                    !unlocked
                      ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                      : isActive
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105"
                      : "bg-white text-gray-700 hover:bg-indigo-100 border-gray-300"
                  }`}
              >
                Puzzle {p.id}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sudoku Board area */}
      <div className="flex-1 flex justify-center items-start">
        {puzzles
          .filter((p) => p.id === active)
          .map((p) => (
            <SudokuBoard
              key={p.id}
              puzzle={p}
              onCheck={handleCheck}
              isUnlocked={isUnlocked(p.id)}
            />
          ))}
      </div>
    </div>
  );
}
