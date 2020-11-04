# Flowchart

Flowchart & Flowchart designer component for React.js([flowchart-vue](https://github.com/joyceworks/flowchart-vue) for Vue.js).

## Usage

```jsx
<Flowchart
  defaultNodes={[
    {
      type: "start",
      name: "Start",
      x: 150,
      y: 190,
      id: 1604410569920,
      approvers: [],
    },
    {
      type: "end",
      name: "End",
      x: 500,
      y: 190,
      id: 1604410572363,
      approvers: [],
    },
  ]}
  defaultConnections={[
    {
      source: { id: 1604410569920, position: "right" },
      destination: { id: 1604410572363, position: "left" },
      id: 1604410587907,
      type: "pass",
    },
  ]}
/>
```

See more at [src/screens/App/index.tsx](https://github.com/joyceworks/flowchart-react/blob/master/src/screens/App/index.tsx).

## Demo

- [GitHub Pages](https://joyceworks.github.io/flowchart-react/)

- Development Environment

  ``` shell
  git clone https://github.com/joyceworks/flowchart-react.git
  cd flowchart-react
  yarn install
  yarn start
  ```
  
  Then open http://localhost:yourport/ in browser.
