import React from "react";
import { ConnectionData, NodeData } from "../schema";
interface ConnectionProps {
    data: ConnectionData;
    nodes: NodeData[];
    isSelected: boolean;
    onMouseDown: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
    onDoubleClick?: (event: React.MouseEvent<SVGGElement, MouseEvent>) => void;
}
declare const FlowchartConnection: ({ data, nodes, isSelected, onMouseDown, onDoubleClick, }: ConnectionProps) => JSX.Element;
export default FlowchartConnection;
