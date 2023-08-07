import { ConnectorPosition, Direction, NodeData } from "../schema";
import React from "react";
interface NodeProps {
    data: NodeData;
    isSelected: boolean;
    isConnecting: boolean;
    onDoubleClick: (event: React.MouseEvent<SVGGElement, MouseEvent>) => void;
    onMouseDown: (event: React.MouseEvent<SVGGElement, MouseEvent>) => void;
    onConnectorMouseDown: (position: ConnectorPosition) => void;
    onControllerMouseDown: (direction: Direction) => void;
    readonly?: boolean;
}
declare const Node: ({ data, isSelected, isConnecting, onDoubleClick, onMouseDown, onConnectorMouseDown, onControllerMouseDown, readonly, }: NodeProps) => JSX.Element;
export default Node;
