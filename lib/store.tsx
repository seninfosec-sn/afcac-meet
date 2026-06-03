"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Reservation } from "./data";

interface StoreContextType {
  reservations: Reservation[];
  loading: boolean;
  addReservation: (r: Reservation) => void;
  updateStatus: (id: string, status: Reservation["status"], tableType: "bilateral" | "salle") => Promise<void>;
  refresh: () => void;
}

const StoreContext = createContext<StoreContextType>({
  reservations: [],
  loading: true,
  addReservation: () => {},
  updateStatus: async () => {},
  refresh: () => {},
});

export function StoreProvider({ children }: { children: ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reservations");
      if (res.ok) {
        const contentType = res.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          const data = await res.json();
          setReservations(data);
        }
      } else {
        // Non authentifié ou session invalide — vide le store
        setReservations([]);
      }
    } catch {
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Optimistic add: prepend locally, then refresh from server
  function addReservation(r: Reservation) {
    setReservations(prev => [r, ...prev]);
    setTimeout(() => fetchReservations(), 500);
  }

  async function updateStatus(id: string, status: Reservation["status"], tableType: "bilateral" | "salle") {
    // Optimistic update
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, tableType }),
    });
    await fetchReservations();
  }

  return (
    <StoreContext.Provider value={{ reservations, loading, addReservation, updateStatus, refresh: fetchReservations }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
