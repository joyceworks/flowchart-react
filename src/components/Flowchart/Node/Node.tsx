import { ConnectorPosition, NodeData } from "../schema";
import OperationNode from "./OperationNode";
import StartEndNode from "./StartEndNode";
import React, { useMemo } from "react";
import { locateConnector } from "../util";
import styled from "styled-components";

const Circle = styled("circle")<{ isConnecting: boolean }>`
  stroke: #bbbbbb;
  cursor: crosshair;
  opacity: ${(props) => (props.isConnecting ? 1 : 0)};
  fill: white;
  stroke-width: 1px;

  :hover {
    opacity: 1;
  }
`;
const G = styled("g")`
  :hover {
    circle {
      opacity: 1;
    }
  }
`;

interface NodeProps {
  data: NodeData;
  isSelected: boolean;
  isConnecting: boolean;
  onDoubleClick: (event: React.MouseEvent<SVGGElement, MouseEvent>) => void;
  onMouseDown: (event: React.MouseEvent<SVGGElement, MouseEvent>) => void;
  onConnectorMouseDown: (position: ConnectorPosition) => void;
}

export default function ({
  data,
  isSelected,
  isConnecting,
  onDoubleClick,
  onMouseDown,
  onConnectorMouseDown,
}: NodeProps) {
  const position = useMemo(() => locateConnector(data), [data]);
  return (
    <>
      <G onDoubleClick={onDoubleClick} onMouseDown={onMouseDown}>
        {data.type !== "start" && data.type !== "end" ? (
          <OperationNode data={data} isSelected={isSelected} />
        ) : (
          <StartEndNode data={data} isSelected={isSelected} />
        )}
        {Object.keys(position).map((key) => {
          return (
            <Circle
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
      </G>
    </>
  );
}
