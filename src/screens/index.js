import React from 'react';
import './index.css';

function App() {
  return <>
    <div className='container'>
      <h1 className="title">Flowchart React</h1>
      <h5 className="subtitle">
        Flowchart & Flowchart designer component for React.js.
      </h5>
      <div id="toolbar">
        <button>Add(Double-click canvas)</button>
        <button>Delete(Del)</button>
        <button>Edit(Double-click node)</button>
        <button>Save</button>
      </div>
    </div>
  </>;
}

export default App;
