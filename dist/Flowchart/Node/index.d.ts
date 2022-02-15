import { ConnectorPosition, NodeData, NodeRender } from "../schema";
import React from "react";
interface NodeProps {
    data: NodeData;
    isSelected: boolean;
    isConnecting: boolean;
    onDoubleClick: (event: React.MouseEvent<SVGGElement, MouseEvent>) => void;
    onMouseDown: (event: React.MouseEvent<SVGGElement, MouseEvent>) => void;
    onConnectorMouseDown: (position: ConnectorPosition) => void;
    render?: NodeRender;
    readonly?: boolean;
}
declare const FlowchartNode: ({ data, isSelected, isConnecting, onDoubleClick, onMouseDown, onConnectorMouseDown, render, readonly, }: NodeProps) => JSX.Element;
export default FlowchartNode;
