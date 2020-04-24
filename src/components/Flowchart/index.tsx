import React, {useState} from 'react';
import './index.css';

export interface IProps {
    width?: string | number;
    height?: string | number;
    nodes?: Array<INode>;
}

export interface INode {
    id: number;
    x: number;
    y: number;
    type: string;
    name: string;
    approvers?: Array<IApprover>;
}

export interface IApprover {
    id: number;
    name: string;
}

interface ICursorToChartOffset {
    x: number;
    y: number;
}

export const Flowchart = (props: IProps) => {
    const [cursorToChartOffset, setCursorToChartOffset] = useState<ICursorToChartOffset>({
        x: 0,
        y: 0
    });

    let chartStyle = {
        width: typeof props.width === "string" ? props.width : props.width + 'px',
        height: typeof props.height === "string" ? props.height : props.height + 'px'
    };
    return <>
        <div id={'chart'} tabIndex={0} style={chartStyle}>
            <span id={'position'} className={'unselectable'}>
                {cursorToChartOffset.x + ', ' + cursorToChartOffset.y}
            </span>
            <svg id={'svg'}/>
        </div>
    </>;
}

