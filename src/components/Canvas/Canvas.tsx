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
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const isDrawing = useRef(false);

    // Initialize canvas
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const resizeCanvas = () => {
        const { offsetWidth, offsetHeight } = canvas;
        canvas.width = offsetWidth;
        canvas.height = offsetHeight;

        // Reset canvas background to white
        const context = canvas.getContext("2d");
        if (context) {
          context.fillStyle = "white";
          context.fillRect(0, 0, canvas.width, canvas.height);
        }
      };

      resizeCanvas();
      const context = canvas.getContext("2d");
      if (context) {
        context.lineCap = "round";
        context.lineJoin = "round";
        contextRef.current = context;
      }

      window.addEventListener("resize", resizeCanvas);
      return () => window.removeEventListener("resize", resizeCanvas);
    }, []);

    // Redraw canvas when history changes
    useEffect(() => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (!canvas || !context) return;

      // Clear canvas and set white background
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Replay drawing history
      drawingHistory.forEach((data) => {
        if (data.type === "start") {
          context.beginPath();
          context.moveTo(data.x, data.y);
        } else {
          context.lineWidth = data.size;
          context.strokeStyle = data.tool === "eraser" ? "white" : data.color;
          context.lineTo(data.x, data.y);
          context.stroke();
        }
      });
    }, [drawingHistory]);

    const startDrawing = useCallback(
      (e: React.MouseEvent) => {
        isDrawing.current = true;
        const { offsetX, offsetY } = e.nativeEvent;
        contextRef.current?.beginPath();
        contextRef.current?.moveTo(offsetX, offsetY);

        sendDrawingData({
          x: offsetX,
          y: offsetY,
          type: "start",
          color: brushColor,
          size: brushSize,
          tool,
        });
      },
      [brushColor, brushSize, tool, sendDrawingData]
    );

    const draw = useCallback(
      (e: React.MouseEvent) => {
        if (!isDrawing.current || !contextRef.current) return;

        const { offsetX, offsetY } = e.nativeEvent;
        contextRef.current.lineWidth = brushSize;
        contextRef.current.strokeStyle =
          tool === "eraser" ? "white" : brushColor;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();

        sendDrawingData({
          x: offsetX,
          y: offsetY,
          type: "draw",
          color: brushColor,
          size: brushSize,
          tool,
        });
      },
      [brushColor, brushSize, tool, sendDrawingData]
    );

    const endDrawing = useCallback(() => {
      isDrawing.current = false;
      contextRef.current?.closePath();
    }, []);

    return (
      <canvas
        ref={(node) => {
          // Pass the ref from forwardRef and fallback to canvasRef
          if (node) {
            canvasRef.current = node;
            if (ref) {
              if (typeof ref === "function") ref(node);
              else ref.current = node;
            }
          }
        }}
        className="w-full h-full border border-gray-300 cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
      />
    );
  }
);

export default Canvas;
