import React, {useState} from 'react';
import './index.css';

interface Props {
    width?: string | number;
    height?: string | number
}

interface ICursorToChartOffset {
    x: number;
    y: number;
}

function Flowchart(props: Props) {
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

export default Flowchart;