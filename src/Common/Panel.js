import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Panel.css';
import { connect } from 'react-redux';
import { removeModule } from '../Modules/actions';

const Screw = () => <img alt='screw' src={require('./screw_header.svg')} height={14} width={14} style={{ margin: 5 }} />;

const PanelEdge = ({ children }) => <div className='panel_edge'>
    <Screw />
    {children}
    <Screw />
</div>;

const Panel = ({ children, dragging, setDragging, width, left, removeModule, moduleId }) => <div className='module-panel'
    style={{ width, left, cursor: dragging ? 'grabbing' : 'grab' }}
    onMouseDown={() => setDragging(true)} onMouseUp={() => setDragging(false)}>
    <PanelEdge>
        <span onClick={() => removeModule(moduleId)} className="btn_delete_module"><FontAwesomeIcon size='xs' icon='trash' /></span>
    </PanelEdge>
    <div className='panel_content'>
        {children}
    </div>
    <PanelEdge />
</div>;

export default connect(null, { removeModule })(Panel);