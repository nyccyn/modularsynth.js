import React, { useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as actions from '../Modules/actions';
import { useAction } from '../storeHelpers';
import styled from 'styled-components';
import { prop } from 'ramda';

const Screw = () =>
    <img alt='screw'
        src={require('./screw_header.svg')}
        height={14} width={14}
        style={{ margin: 5 }} />;

const EdgeContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin: -2px 0;
`;

const PanelEdge = ({ children }) =>
    <EdgeContainer>
        <Screw />
        {children}
        <Screw />
    </EdgeContainer>;

const PanelContainer = styled.div`
    display: flex;
    flex-direction: column;
    background: #E8E8E8;
    border: black 0.2px solid;
    position: ${({ viewMode }) => viewMode ? 'relative' : 'absolute'};
    height: 100%;
    user-select: none;
    width: ${prop('width')}px;
    height: ${prop('height')}px;
    left: ${prop('left')}px;
    top: ${prop('top')}px;
    cursor: ${({ viewMode, dragging }) => viewMode ? 'pointer' : dragging ? 'grabbing' : 'grab'};
`;

const RemoveModuleButton = styled.span`
    visibility: hidden;
    color: gray;
    cursor: pointer;

    &:hover {
        color: black;
    }

    ${PanelContainer}:hover & {
        visibility: ${({ viewMode }) => viewMode ? 'hidden' : 'visible' };
    }
`;

const PanelContent = styled.div`
    flex: 1;
    position: relative;
`;

const Overlay = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 99;
`;

const Panel = props => {
    const { children, setDragging, moduleId, viewMode } = props;
    const removeModule = useAction(actions.removeModule);
    const onTrashMouseDown = useCallback(e => {
        e.stopPropagation();
        e.preventDefault();
    }, []);

    return <PanelContainer {...props} onMouseDown={() => !viewMode && setDragging(true)} onMouseUp={() => !viewMode && setDragging(false)}>
        <PanelEdge>
            <RemoveModuleButton viewMode={viewMode} onClick={() => removeModule(moduleId)} onMouseDown={onTrashMouseDown}>
                <FontAwesomeIcon size='xs' icon='trash' />
            </RemoveModuleButton>
        </PanelEdge>
        <PanelContent>
            { viewMode && <Overlay/> }
            {children}
        </PanelContent>
        <PanelEdge />
    </PanelContainer>;
}

export default Panel;