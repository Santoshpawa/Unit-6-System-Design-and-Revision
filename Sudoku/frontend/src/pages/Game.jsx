import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import PuzzleList from "../components/PuzzleList";
import Badges from "../components/Badges";

export default function Game() {
  const [puzzles, setPuzzles] = useState([]);
  const { user, setUser } = useAuth();

  // 🧩 Fetch puzzles
  useEffect(() => {
    (async () => {
      try {
        const data = await api.get("/puzzles");
        setPuzzles(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user]); // refetch when user progress changes

  // 🔄 Update user progress and persist
  const onChecked = (updated) => {
    if (updated.solvedPuzzles || updated.badges) {
      const newUser = {
        ...user,
        solvedPuzzles: updated.solvedPuzzles || user.solvedPuzzles,
        badges: updated.badges || user.badges,
      };
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
    }
  };

  // ✅ Listen for user-update event (from SudokuBoard)
  useEffect(() => {
    const handleUserUpdate = (e) => {
      const updated = e.detail;
      onChecked(updated);
    };

    window.addEventListener("user-update", handleUserUpdate);
    return () => window.removeEventListener("user-update", handleUserUpdate);
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        Loading user data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sudoku puzzles */}
        <div className="lg:col-span-3 bg-white shadow-lg rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-indigo-700 mb-4">
            Sudoku Puzzles
          </h1>
          <PuzzleList puzzles={puzzles} user={user} onChecked={onChecked} />
        </div>

        {/* Badges section */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-indigo-700 mb-4">🏅 Badges</h2>
          <Badges badges={user?.badges || []} />
        </div>
      </div>
    </div>
  );
}
