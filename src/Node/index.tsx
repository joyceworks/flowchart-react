import { ConnectorPosition, NodeData } from "../schema";
import OperationNode from "./OperationNode";
import StartEndNode from "./StartEndNode";
import React, { useMemo } from "react";
import { locateConnector } from "../util";
import G from "./G";
import Circle from "./Circle";
import { DecisionNode } from "./DecisionNode";

interface NodeProps {
  data: NodeData;
  isSelected: boolean;
  isConnecting: boolean;
  onDoubleClick: (event: React.MouseEvent<SVGGElement, MouseEvent>) => void;
  onMouseDown: (event: React.MouseEvent<SVGGElement, MouseEvent>) => void;
  onConnectorMouseDown: (position: ConnectorPosition) => void;
  readonly?: boolean;
}

const Node = function ({
  data,
  isSelected,
  isConnecting,
  onDoubleClick,
  onMouseDown,
  onConnectorMouseDown,
  readonly,
}: NodeProps) {
  const position = useMemo(() => locateConnector(data), [data]);
  return (
    <>
      <G onDoubleClick={onDoubleClick} onMouseDown={onMouseDown}>
        {data.type === "operation" ? (
          <OperationNode data={data} isSelected={isSelected} />
        ) : data.type === "start" || data.type === "end" ? (
          <StartEndNode data={data} isSelected={isSelected} />
        ) : (
          <DecisionNode data={data} isSelected={isSelected} />
        )}
        {!readonly &&
          Object.keys(position).map((key) => {
            return (
              <Circle
                key={key}
                isConnecting={isConnecting}
                cx={position[key as ConnectorPosition].x}
                cy={position[key as ConnectorPosition].y}
                r={4}
                onMouseDown={(event) => {
                  event.stopPropagation();
                  onConnectorMouseDown(key as ConnectorPosition);
                }}
              />
            );
          })}
        {isSelected ? (
          <>
            <rect
              x={data.x}
              y={data.y}
              width={data.width}
              height={data.height}
              strokeWidth={1}
              stroke={"lightblue"}
              fill={"transparent"}
            />
            <rect
              x={data.x - 3}
              y={data.y - 3}
              width={6}
              height={6}
              strokeWidth={1}
              stroke={"lightblue"}
              fill={"white"}
            />
            <rect
              x={data.x - 3}
              y={data.y + (data.height || 60) - 3}
              width={6}
              height={6}
              strokeWidth={1}
              stroke={"lightblue"}
              fill={"white"}
            />
            <rect
              x={data.x + (data.width || 120) - 3}
              y={data.y - 3}
              width={6}
              height={6}
              strokeWidth={1}
              stroke={"lightblue"}
              fill={"white"}
            />
            <rect
              x={data.x + (data.width || 120) - 3}
              y={data.y + (data.height || 60) - 3}
              width={6}
              height={6}
              strokeWidth={1}
              stroke={"lightblue"}
              fill={"white"}
            />
          </>
        ) : (
          <></>
        )}
      </G>
    </>
  );
};

export default Node;
