"use client"

import { useState, useEffect, useRef } from "react";
import { db } from "../utils/firebase"; // Firebase setup
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { UserSearch, Check, X, MessageSquare } from "lucide-react";
import { FaFilter } from "react-icons/fa";

export default function CoachDashboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    async function fetchPlayers() {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "players"));
      setPlayers(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchPlayers();
  }, []);

  async function handleApproval(playerId, status) {
    const playerRef = doc(db, "players", playerId);
    await updateDoc(playerRef, { verified: status });
    setPlayers(players.map((p) => (p.id === playerId ? { ...p, verified: status } : p)));
    toast.success(`Player ${status === "approved" ? "approved" : "rejected"}`);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <input
          ref={searchRef}
          placeholder="Search players..."
          className="w-full border p-2 rounded"
        />
        <button className="p-2 border rounded flex items-center gap-2">
          <FaFilter /> Filter
        </button>
      </div>
      <div className="space-y-4">
        {loading ? (
          <p>Loading players...</p>
        ) : (
          players
            .filter((player) =>
              player.name.toLowerCase().includes(searchRef.current?.value.toLowerCase() || "")
            )
            .map((player) => (
              <div key={player.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{player.name}</h3>
                  <p className="text-sm text-gray-500">{player.sport} - {player.skillLevel}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2" onClick={() => handleApproval(player.id, "approved")}> <Check className="text-green-600" /> </button>
                  <button className="p-2" onClick={() => handleApproval(player.id, "rejected")}> <X className="text-red-600" /> </button>
                  <button className="p-2 border rounded" onClick={() => toast.success("Chat feature coming soon!")}> <MessageSquare className="text-blue-600" /> </button>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
