import React from "react";
import { NodeProps } from "./schema";

const FlowchartStartEndNode = function ({
  data,
  isSelected = false,
  render,
}: NodeProps): JSX.Element {
  const borderColor = isSelected ? "#666666" : "#bbbbbb";
  const text = render?.(data) || (data.type === "start" ? "Start" : "End");
  return (
    <>
      <ellipse
        cx={data.x + 60}
        cy={data.y + 30}
        rx={60}
        ry={30}
        fill={"white"}
        strokeWidth={1}
        stroke={borderColor}
      />
      <text x={data.x + 60} y={data.y + 5 + 30} textAnchor={"middle"}>
        {text}
      </text>
    </>
  );
};

export default FlowchartStartEndNode;
