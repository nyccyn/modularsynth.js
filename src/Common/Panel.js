import React from 'react';
import './Panel.css';

const Screw = () => <img alt='screw' src={require('./screw_header.svg')} height={14} width={14} style={{ margin: 5 }}/>;

const PanelEdge = ({ children }) => <div className='panel_edge'>
    <Screw/>
    {children}
    <Screw/>
</div>;

const Panel = ({ children, setDragging, width, left }) =>
    <div className='module-panel'
         style={{ width, left }}
         onMouseDown={() => setDragging(true)} onMouseUp={() => setDragging(false)}>
        <PanelEdge/>
        <div className='panel_content'>
            {children}
        </div>
        <PanelEdge/>
    </div>;

export default Panel;