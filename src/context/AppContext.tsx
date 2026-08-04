"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AppContextType {
  favorites: string[];
  toggleFavorite: (carId: string) => void;
  isFavorite: (carId: string) => boolean;
  comparison: string[];
  toggleCompare: (carId: string) => void;
  isInCompare: (carId: string) => boolean;
  clearCompare: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [comparison, setComparison] = useState<string[]>([]);

  useEffect(() => {
    const storedFavs = localStorage.getItem("vidkrytyi_favorites");
    const storedComp = localStorage.getItem("vidkrytyi_comparison");
    if (storedFavs) setFavorites(JSON.parse(storedFavs));
    if (storedComp) setComparison(JSON.parse(storedComp));
  }, []);

  const toggleFavorite = (carId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(carId)
        ? prev.filter((id) => id !== carId)
        : [...prev, carId];
      localStorage.setItem("vidkrytyi_favorites", JSON.stringify(next));
      return next;
    });
  };

  const isFavorite = (carId: string) => favorites.includes(carId);

  const toggleCompare = (carId: string) => {
    setComparison((prev) => {
      const next = prev.includes(carId)
        ? prev.filter((id) => id !== carId)
        : [...prev, carId].slice(0, 4); // Limit comparison to 4 cars
      localStorage.setItem("vidkrytyi_comparison", JSON.stringify(next));
      return next;
    });
  };

  const isInCompare = (carId: string) => comparison.includes(carId);

  const clearCompare = () => {
    setComparison([]);
    localStorage.setItem("vidkrytyi_comparison", JSON.stringify([]));
  };

  return (
    <AppContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        comparison,
        toggleCompare,
        isInCompare,
        clearCompare,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
