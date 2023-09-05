import { locateConnector, pathing } from "../util";
import React, { useCallback, useMemo } from "react";
import { ConnectionData, ConnectorPosition, NodeData } from "../schema";
import { defaultConnectionColors, selectedConnectionColors } from "./constant";

interface ConnectionProps {
  data: ConnectionData;
  nodes: NodeData[];
  isSelected: boolean;
  onMouseDown: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
  onDoubleClick?: (event: React.MouseEvent<SVGGElement, MouseEvent>) => void;
}

export function Connection({
  data,
  nodes,
  isSelected,
  onMouseDown,
  onDoubleClick,
}: ConnectionProps): JSX.Element {
  const getNodeConnectorOffset = useCallback(
    (nodeId: number, connectorPosition: ConnectorPosition) => {
      const node = nodes.filter((item) => item.id === nodeId)[0];
      return locateConnector(node)[connectorPosition];
    },
    [nodes]
  );
  const points = pathing(
    getNodeConnectorOffset(data.source.id, data.source.position),
    getNodeConnectorOffset(data.destination.id, data.destination.position),
    data.source.position,
    data.destination.position
  );
  const colors = useMemo((): { success: string; fail: string } => {
    return isSelected ? selectedConnectionColors : defaultConnectionColors;
  }, [isSelected]);
  let center: number[];
  if (points.length % 2 === 0) {
    const start = points[points.length / 2 - 1];
    const end = points[points.length / 2];
    center = [
      Math.min(start[0], end[0]) + Math.abs(end[0] - start[0]) / 2,
      Math.min(start[1], end[1]) + Math.abs(end[1] - start[1]) / 2,
    ];
  } else {
    center = points[(points.length - 1) / 2];
  }

  return (
    <g>
      <defs>
        <filter x="0" y="0" width="1" height="1" id="solid">
          <feFlood floodColor="#f3f3f3" result="bg" />
          <feMerge>
            <feMergeNode in="bg" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {points.map((point, i) => {
        if (i > points.length - 2) {
          return <></>;
        }

        const source = point;
        const destination = points[i + 1];
        const isLast = i === points.length - 2;
        const type = data.type || "success";
        const color = data.color || colors[type];
        const id = `arrow${color.replace("#", "")}`;
        return (
          <>
            <path
              stroke={color || colors[type]}
              strokeWidth={1}
              fill={"none"}
              d={`M ${source[0]} ${source[1]} L ${destination[0]} ${destination[1]}`}
              markerEnd={isLast ? `url(#${id})` : undefined}
            />
            {isLast && (
              <marker
                id={id}
                markerUnits={"strokeWidth"}
                viewBox={"0 0 12 12"}
                refX={9}
                refY={6}
                markerWidth={12}
                markerHeight={12}
                orient={"auto"}
              >
                <path d={"M2,2 L10,6 L2,10 L6,6 L2,2"} fill={color} />
              </marker>
            )}
            <path
              onMouseDown={onMouseDown}
              onDoubleClick={(event) => {
                event.stopPropagation();
                onDoubleClick?.(event);
              }}
              stroke={"transparent"}
              strokeWidth={5}
              fill={"none"}
              d={`M ${source[0]} ${source[1]} L ${destination[0]} ${destination[1]}`}
            />
            {data.title ? (
              <text
                filter={"url(#solid)"}
                fontSize={12}
                textAnchor={"middle"}
                dominantBaseline={"central"}
                x={center[0]}
                y={center[1]}
              >
                {data.title}
              </text>
            ) : (
              <></>
            )}
          </>
        );
      })}
    </g>
  );
}
