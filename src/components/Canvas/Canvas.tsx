import React, { useRef, useEffect, useCallback, forwardRef } from "react";
import { DrawingData } from "../../types/drawing";

interface CanvasProps {
  brushColor: string;
  brushSize: number;
  tool: "brush" | "eraser";
  sendDrawingData: (data: DrawingData) => void;
  drawingHistory: DrawingData[];
}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ brushColor, brushSize, tool, sendDrawingData, drawingHistory }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDrawing = useRef(false);

    // Initialize canvas and resize
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      // Resize canvas dynamically
      const resizeCanvas = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Re-draw history on resize
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        drawingHistory.forEach((data) => drawOnCanvas(data, context));
      };

      resizeCanvas();

      // Listen for window resize
      window.addEventListener("resize", resizeCanvas);
      return () => window.removeEventListener("resize", resizeCanvas);
    }, [drawingHistory]);

    // Draw on the canvas
    const drawOnCanvas = useCallback((data: DrawingData, context: CanvasRenderingContext2D) => {
      context.lineWidth = data.size;
      context.strokeStyle = data.tool === "eraser" ? "white" : data.color;
      context.lineCap = "round";
      context.lineJoin = "round";

      if (data.type === "start") {
        context.beginPath();
        context.moveTo(data.x, data.y);
      } else if (data.type === "draw") {
        context.lineTo(data.x, data.y);
        context.stroke();
      }
    }, []);

    // Update canvas on history changes
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      // Re-draw the full history
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
      drawingHistory.forEach((data) => drawOnCanvas(data, context));
    }, [drawingHistory, drawOnCanvas]);

    // Handle mouse events
    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const drawingData: DrawingData = { x, y, type: "start", size: brushSize, color: brushColor, tool };
      sendDrawingData(drawingData);
      isDrawing.current = true;
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const drawingData: DrawingData = { x, y, type: "draw", size: brushSize, color: brushColor, tool };
      sendDrawingData(drawingData);
    };

    const handleMouseUp = () => {
      isDrawing.current = false;
    };

    return (
      <canvas
        ref={(node) => {
          canvasRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      ></canvas>
    );
  }
);

export default Canvas;
