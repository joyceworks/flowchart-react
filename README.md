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

#### nodes

Array of nodes.

##### NodeData

| Props   | Description   | Type                        | Default |
|---------|---------------|:----------------------------|---------|
| id      | Identity      | number                      |         |
| title   | Title of node | string                      |         |
| type    | Type of node  | `start`, `end`, `operation` |         |
| x       | X axis        | number                      |         |
| y       | Y axis        | number                      |         |
| payload | Custom data   | `{[key: string]: unknown}`  |         |

#### connections

Connections between nodes.

| Props       | Description      | Type                                                       | Default |
|-------------|------------------|:-----------------------------------------------------------|---------|
| id          | Identity         | number                                                     |         |
| source      | Source info      | `{id: number, position: 'left', 'right', 'top', 'bottom'}` |         |
| destination | Destination info | `{id: number, position: 'left', 'right', 'top', 'bottom'}` |         |

##### ConnectionData

#### readonly

Prop to disabled drag, connect and delete action.

#### style

Style of background svg.

#### render

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

#### onChange

Triggered when a node is deleted, moved, disconnected or connected.

#### onNodeDoubleClick

Triggered when a node is double-clicked.

#### onDoubleClick

Triggered when the background svg is double-clicked.

#### onConnectionDoubleClick

Triggered when a connection is double-clicked.

#### onMouseUp

Triggered when the mouse is up on the background svg.

## License

MIT © [Joyceworks](https://github.com/joyceworks)
