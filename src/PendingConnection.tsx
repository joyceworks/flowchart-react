import { defaultConnectionColors } from "./Connection/constant";
import { Marker } from "./Marker";
import React from "react";

export function PendingConnection({ points }: { points: [number, number][] }) {
  return (
    <g>
      {points!.map((point, i) => {
        if (i > points!.length - 2) {
          return <></>;
        }

        const source = points![i];
        const destination = points![i + 1];
        const isLast = i === points!.length - 2;
        const color = defaultConnectionColors.success;
        const id = `arrow${color.replace("#", "")}`;
        return (
          <>
            <path
              stroke={defaultConnectionColors.success}
              strokeWidth={1}
              fill={"none"}
              d={`M ${source[0]} ${source[1]} L ${destination[0]} ${destination[1]}`}
              markerEnd={isLast ? `url(#${id})` : undefined}
            />
            {isLast && <Marker id={id} color={color} />}
            <path
              stroke={"transparent"}
              strokeWidth={5}
              fill={"none"}
              d={`M ${source.join(" ")} L ${destination.join(" ")}`}
            />
          </>
        );
      })}
    </g>
  );
}
