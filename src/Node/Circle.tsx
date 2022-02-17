import React, { CSSProperties, useMemo, useState } from 'react'

export default function Circle(
  props: {
    isConnecting: boolean
  } & React.SVGAttributes<SVGCircleElement>
): JSX.Element {
  const style = useMemo<CSSProperties>(
    () => ({
      opacity: props.isConnecting ? 1 : 0
    }),
    []
  )
  return (
    <circle
      className={'circle'}
      style={Object.assign(style, props.style)}
      {...props}
    />
  )
}
