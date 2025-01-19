import { useEffect, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import { DrawingData } from "../types/drawing";
import { EVENT_NAMES } from "../utils/events";

const useDrawing = (
  socket: Socket | null,
  roomId: string,
  onRemoteDraw: (data: DrawingData) => void
) => {
  const [brushColor, setBrushColor] = useState("black");
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [drawingHistory, setDrawingHistory] = useState<DrawingData[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Request drawing history when joining
    socket.emit("request-history", { roomId });

    socket.on("drawing-history", (history: DrawingData[]) => {
      setDrawingHistory(history);
    });

    socket.on(EVENT_NAMES.DRAWING_DATA, (data: DrawingData) => {
      onRemoteDraw(data);
      setDrawingHistory((prev) => [...prev, data]);
    });

    return () => {
      socket.off(EVENT_NAMES.DRAWING_DATA);
      socket.off("drawing-history");
    };
  }, [socket, roomId, onRemoteDraw]);

  const sendDrawingData = useCallback(
    (data: DrawingData) => {
      if (socket) {
        const drawingData = {
          ...data,
          tool,
          color: tool === "eraser" ? "white" : brushColor,
        };
        socket.emit(EVENT_NAMES.DRAWING_DATA, { roomId, data: drawingData });
        setDrawingHistory((prev) => [...prev, drawingData]);
      }
    },
    [socket, roomId, tool, brushColor]
  );

  return {
    brushColor,
    setBrushColor,
    brushSize,
    setBrushSize,
    tool,
    setTool,
    sendDrawingData,
    drawingHistory,
  };
};

export default useDrawing;
