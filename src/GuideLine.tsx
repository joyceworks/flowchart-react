import React from "react";
import { Line } from "./schema";

export function GuideLine({ line }: { line: Line }): JSX.Element {
  return (
    <g>
      <line
        strokeDasharray={"3 3"}
        stroke={"#666666"}
        strokeWidth={1}
        fill={"none"}
        x1={line[0].x}
        y1={line[0].y}
        x2={line[1].x}
        y2={line[1].y}
      />
    </g>
  );
}
