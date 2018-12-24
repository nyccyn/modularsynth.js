import React from 'react';
import './Panel.css';

const Screw = () => <img alt='screw' src={require('./screw_header.svg')} height={14} width={14} style={{ margin: 5 }}/>;

const PanelEdge = ({ children }) => <div className='panel_edge'>
    <Screw/>
    {children}
    <Screw/>
</div>;

const Panel = ({ header, children }) => <div className='module-panel'>
    <PanelEdge>
        <span>{header}</span>
    </PanelEdge>
    {children}
    <PanelEdge/>
</div>;
export default Panel;