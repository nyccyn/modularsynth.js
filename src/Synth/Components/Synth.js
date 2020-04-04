import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import ModulePicker from '../../Modules/Components/ModulePicker';
import CablesContainer from '../../Cables/Components/CablesContainer';
import PresetManager from './PresetManager';
import * as modulesActions from '../../Modules/actions';
import * as cablesAction from '../../Cables/actions';
import './Rack.css';
import Panel from '../../Common/Panel';
import createPulseOscillator from '../helpers/createPulseOscillator';
import createVoltToHzConverter from '../helpers/createVoltToHzConverter';
import { useAction } from '../../storeHelpers';

const Synth = () => {
    const modules = useSelector(R.path(['modules', 'modules']));
    const racks = useSelector(R.path(['modules', 'racks']));
    const startingPort = useSelector(R.path(['modules', 'startingPort']));
    const audioContextInitiliazed = useSelector(R.path(['modules', 'audioContextInitiliazed']));

    const unsetStartingPort = useAction(modulesActions.unsetStartingPort);
    const moveModule = useAction(modulesActions.moveModule);
    const modifyCable = useAction(cablesAction.modifyCable);
    const removeCable = useAction(cablesAction.removeCable);

    const [draggingModuleId, setDraggingModuleId] = useState(null);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);
    const [activeRackId, setActiveRackId] = useState(0);
    const [audioContext, setAudioContext] = useState(null);

    useEffect(() => {
        window.onscroll = e => setScrollTop(window.scrollY);
    }, []);

    useEffect(() => {
        if (audioContext) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const newAudioContext = new AudioContext();
        newAudioContext.createPulseOscillator = createPulseOscillator;
        newAudioContext.createVoltToHzConverter = createVoltToHzConverter;
        setAudioContext(newAudioContext);
    }, [audioContext, audioContextInitiliazed]);

    const moveCable = useCallback((e) => {
        if (!startingPort) return;
        modifyCable({
            portId: `${startingPort.moduleId}-${startingPort.portId}`,
            toPoint: { x: e.clientX, y: e.clientY + scrollTop }
        });
    }, [modifyCable, startingPort, scrollTop]);

    const dragModule = useCallback((e) => {
        if (!draggingModuleId) return;
        moveModule(draggingModuleId, e.clientX, activeRackId);
    }, [draggingModuleId, moveModule, activeRackId]);

    const handleMouseUp = useCallback(() => {
        if (!startingPort) return;
        removeCable(`${startingPort.moduleId}-${startingPort.portId}`);
        unsetStartingPort();
    }, [unsetStartingPort, removeCable, startingPort]);

    const handleMouseMove = useCallback((e) => {
        moveCable(e);
        dragModule(e);
    }, [moveCable, dragModule]);

    const handleDragging = useCallback((moduleId) => {
        return isDragging => {
            setDraggingModuleId(isDragging ? moduleId : null);
        }
    }, []);;

    const handleRackScroll = useCallback((e) => {
        setScrollLeft(e.target.scrollLeft);
    }, []);

    return <div onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} onScroll={handleRackScroll}>
        <ModulePicker />
        <PresetManager />
        <div>
            <div style={{ overflowX: 'scroll' }}>
                {
                    racks.map((moduleIds, rackId) =>
                        <div key={rackId} className='rack' style={{ width: `calc(100% + ${scrollLeft}px)` }} onMouseEnter={() => setActiveRackId(rackId)}>
                            {
                                audioContext && moduleIds.map(id => {
                                    const { Module, width, left } = modules[id];
                                    return <Panel key={id}
                                        rackId={rackId}
                                        moduleId={id}
                                        setDragging={handleDragging(id)}
                                        dragging={id === draggingModuleId}
                                        width={width} left={left}>
                                        <Module id={id} audioContext={audioContext} />
                                    </Panel>;
                                })
                            }
                        </div>
                    )
                }
            </div>
            <CablesContainer scrollLeft={scrollLeft} scrollTop={scrollTop} height={racks.length * 1.5 * 370} />
        </div>
    </div>;
};

export default Synth;