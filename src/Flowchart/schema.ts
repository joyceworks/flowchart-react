export interface NodeData {
  id: number;
  x: number;
  y: number;
  name: string;
  type: NodeType;
  approvers?: { name: string; [key: string]: any }[];
}

export interface ConnectionData {
  id: number;
  type: "pass" | "reject";
  source: {
    id: number;
    position: ConnectorPosition;
  };
  destination: {
    id: number;
    position: ConnectorPosition;
  };
}

export interface DragItem {
  id: number;
  left: number;
  top: number;
  type: "start" | "end" | "operation";
}

export interface Point {
  x: number;
  y: number;
}

export type Line = [Point, Point];

export interface SelectionInfo {
  start: Point;
  end: Point;
}

export type ConnectorPosition = "left" | "right" | "top" | "bottom";
export type NodeType = "start" | "end" | "operation";
