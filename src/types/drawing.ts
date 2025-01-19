export interface DrawingData {
  x: number;
  y: number;
  type: "start" | "draw";
  color: string;
  size: number;
  tool: "brush" | "eraser";
}

export interface Point {
  x: number;
  y: number;
}
