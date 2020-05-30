import React, { useCallback } from 'react';
import ReactTooltip from 'react-tooltip';
import styled from 'styled-components';
import * as actions from '../actions';
import { MODULE_TYPE, createModule } from '../moduleFactory';
import Panel from 'Common/Panel';
import { useAction } from 'storeHelpers';
import { pipe, values, map } from 'ramda';

const Overlay = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 99;
    background-color: rgba(0,0,0,0.4);
    display: flex;
    justify-content: center;
    padding-top: 20px;
`;

const ModuleWrapper = styled.div`
    height: 370px;
    border-style: solid;
    border-color: #c9c9c9;
    transform: scale(0.7);

    &:hover {
        border-color: white;
    }
`;

const Tooltip = styled(ReactTooltip)`
    /* width: 100px; */
    &.show {
        opacity: 1;
    }

    .multi-line {
        text-align: left;
    }
`;

const ModulePicker = ({ onClose }) => {
    const addModule = useAction(type => actions.addModule({ type }));
    
    const handleAdd = useCallback((e, type) => {
        e.stopPropagation();
        e.preventDefault();
        addModule(type);
    }, [addModule]);
    
    return <Overlay onClick={onClose}>
        {
            pipe(
                values,
                map(type => {
                    const { width, title, Module } = createModule({ type });
                    return <ModuleWrapper data-tip={title} key={type} onClick={e => handleAdd(e, type)}>
                        <Panel viewMode
                            width={width}
                            height={370}>
                            <Module viewMode />
                        </Panel>
                    </ModuleWrapper>
                }
                ))(MODULE_TYPE)
        }
        <Tooltip place='right' multiline/>
    </Overlay>;
};

export default ModulePicker;
