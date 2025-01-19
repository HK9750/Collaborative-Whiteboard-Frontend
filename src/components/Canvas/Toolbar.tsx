import React from "react";

interface ToolbarProps {
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  tool: "brush" | "eraser";
  setTool: (tool: "brush" | "eraser") => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  brushColor,
  setBrushColor,
  brushSize,
  setBrushSize,
  tool,
  setTool,
}) => {
  return (
    <div className="flex items-center space-x-4 p-4 border-b bg-gray-100">
      <div className="flex items-center space-x-2">
        <label htmlFor="colorPicker" className="text-sm font-medium">
          Color:
        </label>
        <input
          id="colorPicker"
          type="color"
          value={brushColor}
          onChange={(e) => setBrushColor(e.target.value)}
          className="w-10 h-10 cursor-pointer border border-gray-300 rounded"
          disabled={tool === "eraser"}
        />
      </div>
      <div className="flex items-center space-x-2">
        <label htmlFor="sizeSlider" className="text-sm font-medium">
          Size:
        </label>
        <input
          id="sizeSlider"
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-32 cursor-pointer"
        />
        <span className="text-sm">{brushSize}px</span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setTool("brush")}
          className={`px-3 py-1 rounded ${
            tool === "brush"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Brush
        </button>
        <button
          onClick={() => setTool("eraser")}
          className={`px-3 py-1 rounded ${
            tool === "eraser"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Eraser
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
