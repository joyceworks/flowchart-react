import React, { CSSProperties } from "react";
export interface NodeData {
    id: number;
    title: string | (() => string) | JSX.Element;
    type?: NodeType;
    x: number;
    y: number;
    payload?: {
        [key: string]: unknown;
    };
    width?: number;
    height?: number;
    containerProps?: SupportedSVGShapeProps;
    textProps?: SupportedSVGTextProps;
}
export declare type SupportedSVGShapeProps = Pick<React.SVGProps<SVGElement>, "fill" | "stroke">;
export declare type SupportedSVGTextProps = Pick<React.SVGProps<SVGTextElement>, "fill">;
export interface ConnectionData {
    type?: "success" | "fail";
    source: {
        id: number;
        position: ConnectorPosition;
    };
    destination: {
        id: number;
        position: ConnectorPosition;
    };
    title?: string;
    color?: string;
}
export interface Point {
    x: number;
    y: number;
}
export declare type Line = [Point, Point];
export interface SelectingInfo {
    start: Point;
    end: Point;
}
export declare type ConnectorPosition = "left" | "right" | "top" | "bottom";
export declare type NodeType = "start" | "end" | "operation" | "decision";
export interface FlowchartProps {
    style?: CSSProperties;
    nodes: NodeData[];
    connections: ConnectionData[];
    onNodeDoubleClick?: (data: NodeData) => void;
    onChange?: (nodes: NodeData[], connections: ConnectionData[]) => void;
    onConnectionDoubleClick?: (data: ConnectionData) => void;
    onDoubleClick?: ((event: React.MouseEvent<SVGSVGElement>, zoom: number) => void) | undefined;
    onMouseUp?: ((event: React.MouseEvent<SVGSVGElement>, zoom: number) => void) | undefined;
    readonly?: boolean;
    defaultNodeSize?: {
        width: number;
        height: number;
    };
    showToolbar?: boolean | ("start-end" | "operation" | "decision")[];
    connectionPosition?: "bottom" | "top";
    /**
     * Custom class name for the flowchart container
     */
    className?: string;
}
export interface DragMovingInfo {
    targetIds: number[];
    deltas: {
        x: number;
        y: number;
    }[];
    moved?: true;
}
export interface DragCreatingInfo {
    type: NodeType;
    x: number;
    y: number;
}
export interface DragConnectingInfo {
    source: NodeData;
    sourcePosition: ConnectorPosition;
}
export interface IFlowchart {
    getData: () => {
        nodes: NodeData[];
        connections: ConnectionData[];
    };
}
export interface ControlInfo {
    targetId: number;
    direction: Direction;
}
export declare type Direction = "l" | "r" | "u" | "d" | "lu" | "ru" | "ld" | "rd";
