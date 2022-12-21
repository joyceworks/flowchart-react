import React from "react";
import { NodeProps } from "./schema";
import { SupportedSVGShapeProps } from "../schema";
import { Text } from "./Text";

const StartEndNode = function ({
  data,
  isSelected = false,
}: NodeProps): JSX.Element {
  const borderColor = isSelected ? "#666666" : "#bbbbbb";
  const halfWidth = (data.width || 120) / 2;
  const halfHeight = (data.height || 60) / 2;
  return (
    <>
      <ellipse
        cx={data.x + halfWidth}
        cy={data.y + halfHeight}
        rx={halfWidth}
        ry={halfHeight}
        fill={"white"}
        strokeWidth={1}
        stroke={borderColor}
        {...(data.containerProps as SupportedSVGShapeProps)}
      />
      <Text data={data} />
    </>
  );
};

export default StartEndNode;
