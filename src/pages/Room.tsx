import React, { useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import useSocket from "../hooks/useSocket";
import useDrawing from "../hooks/useDrawing";
import useWebRTC from "../hooks/useWebrtc";
import Canvas from "../components/Canvas/Canvas";
import Toolbar from "../components/Canvas/Toolbar";
import { DrawingData } from "../types/drawing";

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { socket, error } = useSocket(
    import.meta.env.VITE_SOCKET_URL,
    roomId || ""
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleRemoteDraw = useCallback((data: DrawingData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Set drawing styles based on received data
    context.lineWidth = data.size;
    context.strokeStyle = data.tool === "eraser" ? "white" : data.color;
    context.lineCap = "round";
    context.lineJoin = "round";

    if (data.type === "start") {
      // Start a new path at the received coordinates
      context.beginPath();
      context.moveTo(data.x, data.y);
    } else {
      // Continue the path to the new coordinates and draw
      context.lineTo(data.x, data.y);
      context.stroke();
    }

    // If it's the end of a drawing action, close the path
    if (data.type === "draw") {
      context.closePath();
    }
  }, []);

  const {
    brushColor,
    setBrushColor,
    brushSize,
    setBrushSize,
    tool,
    setTool,
    sendDrawingData,
    drawingHistory,
  } = useDrawing(socket, roomId || "", handleRemoteDraw);

  const { sendData } = useWebRTC(socket, roomId || "");

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">
          Error connecting to server: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-100">
        <h1 className="text-lg font-semibold">Room: {roomId}</h1>
        <button
          onClick={() => navigator.clipboard.writeText(roomId || "")}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Copy Room ID
        </button>
      </div>
      <Toolbar
        brushColor={brushColor}
        setBrushColor={setBrushColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        tool={tool}
        setTool={setTool}
      />
      <div className="flex-1 relative">
        <Canvas
          ref={canvasRef}
          brushColor={brushColor}
          brushSize={brushSize}
          tool={tool}
          sendDrawingData={(data) => {
            sendDrawingData(data);
            sendData(data);
          }}
          drawingHistory={drawingHistory}
        />
      </div>
    </div>
  );
};

export default Room;
