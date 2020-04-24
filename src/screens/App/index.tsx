import React from 'react';
import './index.css';
import {Flowchart, INode} from '../../components/Flowchart';

function App() {
    const nodes: INode[] = [
        {id: 1, x: 50, y: 220, name: 'Start', type: 'start'},
        {id: 2, x: 630, y: 220, name: 'End', type: 'end'},
        {
            id: 3,
            x: 340,
            y: 130,
            name: 'Operation',
            type: 'operation',
            approvers: [{id: 1, name: 'Joyce'}],
        },
        {
            id: 4,
            x: 240,
            y: 220,
            name: 'Operation',
            type: 'operation',
            approvers: [{id: 2, name: 'Allen'}],
        },
        {
            id: 5,
            x: 440,
            y: 220,
            name: 'Operation',
            type: 'operation',
            approvers: [{id: 3, name: 'Teresa'}],
        },
    ];
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
            <Flowchart nodes={nodes} height={500} width={'100%'}/>
        </div>
    </>;
}

export default App;
