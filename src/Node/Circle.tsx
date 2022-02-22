import React, { CSSProperties, useMemo } from "react";

export default function Circle(
  props: {
    isConnecting: boolean;
  } & React.SVGAttributes<SVGCircleElement>
): JSX.Element {
  const style = useMemo<CSSProperties>(
    () => ({
      opacity: props.isConnecting ? 1 : 0,
    }),
    [props.isConnecting]
  );
  return (
    <circle
      className={"circle"}
      style={Object.assign(style, props.style)}
      {...props}
    />
  );
}
