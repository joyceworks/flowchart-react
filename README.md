# Flowchart React

> Flowchart &amp; Flowchart designer for React.js

[![NPM](https://img.shields.io/npm/v/flowchart-react.svg)](https://www.npmjs.com/package/flowchart-react) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

<img width="800" alt="image" src="https://user-images.githubusercontent.com/5696485/154805805-b8967cea-a4ff-45e1-acf2-524ae1150dd3.png">

## Install

```bash
npm install --save flowchart-react
# or
yarn add flowchart-react
```

## Usage

```tsx
import React, { Component } from 'react'

import Flowchart from 'flowchart-react'

const App = () => {
  const [nodes, setNodes] = useState<NodeData[]>([
    {
      type: 'start',
      title: 'Start',
      x: 150,
      y: 190,
      id: 1604410569920,
    },
    {
      type: 'end',
      title: 'End',
      x: 500,
      y: 190,
      id: 1604410572363,
    },
    {
      x: 330,
      y: 190,
      id: 1604410575428,
      title: 'New',
      type: 'operation',
      content: 'Joyce'
    },
    {
      x: 330,
      y: 300,
      id: 1604410591865,
      title: 'New',
      type: 'operation',
      content: 'No approver'
    }
  ])
  const [conns, setConns] = useState<ConnectionData[]>([
    {
      source: { id: 1604410569920, position: 'right' },
      destination: { id: 1604410575428, position: 'left' },
      id: 1604410587907,
      type: 'success'
    },
    {
      source: { id: 1604410575428, position: 'right' },
      destination: { id: 1604410572363, position: 'left' },
      id: 1604410590524,
      type: 'success'
    },
    {
      source: { id: 1604410569920, position: 'bottom' },
      destination: { id: 1604410591865, position: 'left' },
      id: 1604410596866,
      type: 'success'
    },
    {
      source: { id: 1604410591865, position: 'right' },
      destination: { id: 1604410572363, position: 'bottom' },
      id: 1604410599205,
      type: 'success'
    }
  ])

  return <Flowchart
    onChange={(nodes, connections) => {
      setNodes(nodes);
      setConns(connections);
    }}
    style={{ width: 800, height: 600 }}
    nodes={nodes}
    connections={conns}
  />
}
```

## Demo

[https://github.com/joyceworks/flowchart-react-demo](https://github.com/joyceworks/flowchart-react-demo)

## API

### Props

#### nodes: `NodeData[]`

Array of nodes.

##### NodeData

| Props   | Description     | Type                        | Default | Required |
|---------|-----------------|:----------------------------|---------|----------|
| id      | Identity        | number                      |         | true     |
| title   | Title of node   | string                      |         | true     |
| content | Content of node | string                      |         | false    |
| type    | Type of node    | `start`, `end`, `operation` |         | true     |
| x       | X axis          | number                      |         | true     |
| y       | Y axis          | number                      |         | true     |
| payload | Custom data     | `{[key: string]: unknown}`  |         | false    |

#### connections: `ConnectionData[]`

Connections between nodes.

##### ConnectionData

| Props       | Description        | Type                                                       | Default | Required |
|-------------|--------------------|:-----------------------------------------------------------|---------|----------|
| id          | Identity           | number                                                     |         | true     |
| type        | Type of connection | `success`, `fail`                                          |         | false    |
| source      | Source info        | `{id: number, position: 'left', 'right', 'top', 'bottom'}` |         | true     |
| destination | Destination info   | `{id: number, position: 'left', 'right', 'top', 'bottom'}` |         | true     |

#### readonly: `boolean`

Prop to disabled drag, connect and delete action.

#### style: `React.CSSProperties`

Style of background svg.

#### render: `(node: NodeData) => string`

Function to customize node content.

```typescript
function customRender (node) {
  if (node.type !== "operation") {
    return undefined;
  }
  if (!data.payload.approvers) {
    return "No approver";
  }
  let text;
  for (let i = 0; i < data.payload.approvers.length; i++) {
    if (i > 0) {
      text += "...";
      break;
    }
    text = data.payload.approvers[i].name;
  }
  return text;
}
```

### Events

#### onChange: `(nodes: NodeData[], connections: ConnectionData[]) => void`

Triggered when a node is deleted, moved, disconnected or connected.

#### onNodeDoubleClick: `(node: NodeData) => void`

Triggered when a node is double-clicked.

#### onDoubleClick: `(event: React.MouseEvent<SVGGElement, MouseEvent>, zoom: number) => void`

Triggered when the background svg is double-clicked.

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

#### onMouseUp: `(event: React.MouseEvent<SVGSVGElement>, zoom: number) => void`

Triggered when the mouse is up on the background svg.

## License

MIT © [Joyceworks](https://github.com/joyceworks)
