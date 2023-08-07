import { ConnectorPosition, Direction, NodeData } from "../schema";
import OperationNode from "./OperationNode";
import StartEndNode from "./StartEndNode";
import React, { useMemo } from "react";
import { locateConnector } from "../util";
import G from "./G";
import Circle from "./Circle";
import { DecisionNode } from "./DecisionNode";
import { Controller } from "./Controller";

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

const Node = function ({
  data,
  isSelected,
  isConnecting,
  onDoubleClick,
  onMouseDown,
  onConnectorMouseDown,
  onControllerMouseDown,
  readonly,
}: NodeProps) {
  const position = useMemo(() => locateConnector(data), [data]);
  return (
    <>
      <G onDoubleClick={onDoubleClick} onMouseDown={onMouseDown}>
        {data.type === "operation" || !data.type ? (
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
                r={3}
                onMouseDown={(event) => {
                  event.stopPropagation();
                  onConnectorMouseDown(key as ConnectorPosition);
                }}
              />
            );
          })}
        {isSelected && !readonly ? (
          <Controller onMouseDown={onControllerMouseDown} data={data} />
        ) : (
          <></>
        )}
      </G>
    </>
  );
};

export default Node;
