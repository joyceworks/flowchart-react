# Flowchart React

> Lightweight flowchart &amp; flowchart designer for React.js

[![NPM](https://img.shields.io/npm/v/flowchart-react.svg)](https://www.npmjs.com/package/flowchart-react) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

English | [中文](https://www.joyceworks.com/2022/02/26/flowchart-react-readme-cn/)

<img width="801" alt="image" src="https://user-images.githubusercontent.com/5696485/175803118-bd1ef913-4854-43ab-9338-d8f6deb5c81a.png">

## Install

```bash
npm install --save flowchart-react
# or
yarn add flowchart-react
```

## Usage

```tsx
import React, { useState } from "react";
import Flowchart from "flowchart-react";
import { ConnectionData, NodeData } from "flowchart-react/dist/schema";

const App = () => {
  const [nodes, setNodes] = useState<NodeData[]>([
    {
      type: "start",
      title: "Start",
      x: 150,
      y: 190,
      id: 1,
    },
    {
      type: "end",
      title: "End",
      x: 500,
      y: 190,
      id: 2,
    },
    {
      x: 330,
      y: 190,
      id: 3,
      title: "Joyce",
      type: "operation",
    },
    {
      x: 330,
      y: 300,
      id: 4,
      title: () => {
        return "No approver";
      },
      type: "operation",
    },
  ]);
  const [conns, setConns] = useState<ConnectionData[]>([
    {
      source: { id: 1, position: "right" },
      destination: { id: 3, position: "left" },
      type: "success",
    },
    {
      source: { id: 3, position: "right" },
      destination: { id: 2, position: "left" },
      type: "success",
    },
    {
      source: { id: 1, position: "bottom" },
      destination: { id: 4, position: "left" },
      type: "success",
    },
    {
      source: { id: 4, position: "right" },
      destination: { id: 2, position: "bottom" },
      type: "success",
    },
  ]);

  return (
    <Flowchart
      onChange={(nodes, connections) => {
        setNodes(nodes);
        setConns(connections);
      }}
      style={{ width: 800, height: 600 }}
      nodes={nodes}
      connections={conns}
    />
  );
};

export default App;
```

## Demo

- [CodeSandbox](https://codesandbox.io/s/stoic-borg-w626tt)

## API

### Props

#### nodes: `NodeData[]`

Array of nodes.

##### NodeData

| Props              | Description         | Type                                    | Default | Required |
|--------------------|---------------------|:----------------------------------------|---------|----------|
| id                 | Identity            | number                                  |         | true     |
| title              | Title of node       | string, `(node: NodeData) => string`    |         | true     |
| type               | Type of node        | `start`, `end`, `operation`, `decision` |         | true     |
| x                  | X axis              | number                                  |         | true     |
| y                  | Y axis              | number                                  |         | true     |
| payload            | Custom data         | `{[key: string]: unknown}`              |         | false    |
| width              | Node width          | number                                  | `120`   | false    |
| height             | Node height         | number                                  | `60`    | false    |
| connectionPosition | Connection position | `top`, `bottom`                         | `top`   | false    |
| containerProps     |                     | SupportedSVGShapeProps                  |         | false    |
| textProps          |                     | SupportedSVGTextProps                   |         | false    |

##### SupportedSVGShapeProps

| Props  | Description | Type   | Default | Required |
|--------|-------------|:-------|---------|----------|
| fill   |             | string |         | false    |
| stroke |             | string |         | false    |

##### SupportedSVGTextProps

| Props  | Description | Type   | Default | Required |
|--------|-------------|:-------|---------|----------|
| fill   |             | string |         | false    |

#### connections: `ConnectionData[]`

Connections between nodes.

##### ConnectionData

| Props       | Description         | Type                                                       | Default | Required |
|-------------|---------------------|:-----------------------------------------------------------|---------|----------|
| type        | Type of connection  | `success`, `fail`                                          |         | false    |
| source      | Source info         | `{id: number, position: 'left', 'right', 'top', 'bottom'}` |         | true     |
| destination | Destination info    | `{id: number, position: 'left', 'right', 'top', 'bottom'}` |         | true     |
| title       | Title of connection | string                                                     |         | false    |

#### readonly: `boolean | undefined`

Prop to disabled drag, connect and delete action.

#### style: `React.CSSProperties`

Style of background svg.

#### defaultNodeSize: `{width: number, height: number} | undefined`

Default: `{ width: 120, height: 60 }`.

#### showToolbar: `boolean | undefined`

`false` to hide toolbar.

### Events

#### onChange: `(nodes: NodeData[], connections: ConnectionData[]) => void`

Triggered when a node is deleted(click a node and press `delete`), moved, disconnected(click a connection and press `delete`) or connected.

#### onNodeDoubleClick: `(node: NodeData) => void`

Triggered when a node is double-clicked.

> Tip: Double-click to edit.

#### onDoubleClick: `(event: React.MouseEvent<SVGGElement, MouseEvent>, zoom: number) => void`

Triggered when the background svg is double-clicked.

> Tip: Double-click to create a node.

```typescript
function handleDoubleClick(event: React.MouseEvent<SVGGElement, MouseEvent>, zoom: number): void {
  const point = {
    x: event.nativeEvent.offsetX / zoom,
    y: event.nativeEvent.offsetY / zoom,
    id: +new Date(),
  };
  let nodeData: NodeData;
  if (!nodes.find((item) => item.type === "start")) {
    nodeData = {
      type: "start",
      title: "Start",
      ...point,
    };
  } else if (!nodes.find((item) => item.type === "end")) {
    nodeData = {
      type: "end",
      title: "End",
      ...point,
    };
  } else {
    nodeData = {
      ...point,
      title: "New",
      type: "operation",
    };
  }
  setNodes((prevState) => [...prevState, nodeData]);
}
```

#### onConnectionDoubleClick: `(connection: ConnectionData) => void`

Triggered when a connection is double-clicked.

> Tip: Double-click to edit connection.

#### onMouseUp: `(event: React.MouseEvent<SVGSVGElement>, zoom: number) => void`

Triggered when the mouse is up on the background svg.

> Tip: Drop something to here to implement node creation.

## License

MIT © [Joyceworks](https://github.com/joyceworks)
