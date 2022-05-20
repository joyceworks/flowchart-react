import React from "react";

export default function G(
  props: React.SVGAttributes<SVGGElement>
): JSX.Element {
  return <g className={"g " + (props.className || "")} {...props} />;
}
