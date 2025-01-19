import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const createRoom = useCallback(() => {
    const newRoomId = Math.random().toString(36).substring(2, 9);
    navigate(`/room/${newRoomId}`);
  }, [navigate]);

  const joinRoom = useCallback(() => {
    if (!roomId.trim()) {
      setError("Please enter a room ID");
      return;
    }
    setError("");
    navigate(`/room/${roomId.trim()}`);
  }, [roomId, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Collaborative Whiteboard
        </h1>
        <button
          onClick={createRoom}
          className="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Create New Room
        </button>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={joinRoom}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
