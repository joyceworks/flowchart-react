import React from 'react';
import './index.css';
import Flowchart from '../../components/Flowchart';

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
      <Flowchart height={500} width={'100%'}/>
    </div>
  </>;
}

export default App;
