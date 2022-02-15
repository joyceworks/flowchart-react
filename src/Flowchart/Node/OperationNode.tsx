import React from "react";
import { NodeProps } from "./schema";

const FlowchartOperationNode = function ({
  data,
  isSelected = false,
  render,
}: NodeProps): JSX.Element {
  const borderColor = isSelected ? "#666666" : "#bbbbbb";
  const text =
    render?.(data) ||
    (!data.approvers || data.approvers.length === 0
      ? "No approver"
      : data.approvers.length > 1
      ? `${data.approvers[0].name + "..."}`
      : data.approvers[0].name);
  return (
    <>
      <rect
        x={data.x}
        y={data.y}
        height={20}
        fill={"#f1f3f4"}
        strokeWidth={1}
        width={120}
        stroke={borderColor}
      />
      <text x={data.x + 4} y={data.y + 15}>
        {data.name}
      </text>
      <rect
        width={120}
        height={40}
        fill={"white"}
        x={data.x}
        y={data.y + 20}
        strokeWidth={1}
        stroke={borderColor}
      />
      <text x={data.x + 60} y={data.y + 25 + 20} textAnchor={"middle"}>
        {text}
      </text>
    </>
  );
};

export default FlowchartOperationNode;
