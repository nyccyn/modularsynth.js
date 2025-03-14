import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import * as R from 'ramda';
import ModulePicker from 'Modules/Components/ModulePicker';
import CablesContainer from 'Cables/Components/CablesContainer';
import PresetManager from './PresetManager';
import * as modulesActions from 'Modules/actions';
import * as cablesAction from 'Cables/actions';
import './Rack.css';
import Panel from 'Common/Panel';
import createPulseOscillator from '../helpers/createPulseOscillator';
import createVoltToHzConverter from '../helpers/createVoltToHzConverter';
import createGate from '../helpers/createGate';
import createClockProcessorNode from '../helpers/createClockProcessorNode';
import { useAction } from 'storeHelpers';
import rackBg from './rack_bg.svg';
import IconButton from 'Common/IconButton';

const RACK_HEIGHT = 370;

const Container = styled.div`
    position: relative;
`;

const SynthContainer = styled.div`
    overflow-x: scroll;
    position: relative;
    height: 100%;
`;

const Rack = styled.div`
    width: ${({ $scrollLeft }) => `calc(100% + ${$scrollLeft}px)`};
    position: relative;
    user-select: none;
    background-size: contain;
    background-image: url(${rackBg});
    height: ${RACK_HEIGHT}px;    
`;

const TopBar = styled.div`
    display: flex;
    flex-direction: row;
    background-color: #353535;
    align-items: center;
    height: 50px;
    padding-left: 30px;
`;

const Synth = () => {    
    const modulesState = useSelector(({ modules: { modules } }) => modules);
    const modules = useMemo(() => Object.values(modulesState), [modulesState]);
    const racks = useSelector(({ modules: { racks } }) => racks);
    const startingPort = useSelector(({ modules: { startingPort } }) => startingPort);

    const unsetStartingPort = useAction(modulesActions.unsetStartingPort);
    const moveModule = useAction(modulesActions.moveModule);
    const modifyCable = useAction(cablesAction.modifyCable);
    const removeCable = useAction(cablesAction.removeCable);

    const [draggingModuleId, setDraggingModuleId] = useState(null);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);
    const [activeRackId, setActiveRackId] = useState(0);
    const [audioContext, setAudioContext] = useState(null);
    const [displayPicker, setDisplayPicker] = useState(false);

    useEffect(() => {
        window.onscroll = e => setScrollTop(window.scrollY);
    }, []);

    const initAudioContext = useCallback(async () => {
        if (audioContext) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const newAudioContext = new AudioContext();  
   
        await newAudioContext.audioWorklet.addModule('worklet/clock-processor.js');
        await newAudioContext.audioWorklet.addModule('worklet/gate-processor.js');
        newAudioContext.createPulseOscillator = createPulseOscillator;
        newAudioContext.createVoltToHzConverter = createVoltToHzConverter;
        newAudioContext.createGate = createGate;
        newAudioContext.createClock = createClockProcessorNode;
        setAudioContext(newAudioContext);
    }, [audioContext])

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

    const handleAddModule = useCallback(async () => {
        await initAudioContext();
        setDisplayPicker(true);        
    }, [setDisplayPicker, initAudioContext])

    return <Container onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} onScroll={handleRackScroll}>         
        { displayPicker && <ModulePicker onClose={() => setDisplayPicker(false)}/> }       
        <TopBar>            
            <IconButton icon='plus-circle' title='Add Module' onClick={handleAddModule} />
            <PresetManager initAudioContext={initAudioContext}/>
        </TopBar>        
        <SynthContainer>            
            {
                R.pipe(
                    R.range(0),
                    R.map(rackId => <Rack key={rackId} $scrollLeft={scrollLeft} onMouseEnter={() => setActiveRackId(rackId)} />)
                )(racks)
            }
            {
                audioContext && modules.map(({ Module, width, left, id, rackId, ...otherProps }) =>
                    <Panel key={id} top={rackId * RACK_HEIGHT}
                        moduleId={id}
                        setDragging={handleDragging(id)}
                        dragging={id === draggingModuleId}
                        width={width}
                        height={RACK_HEIGHT}                        
                        left={left}>                            
                        <Module id={id} audioContext={audioContext} {...otherProps}/>
                    </Panel>
                )
            }
        </SynthContainer>
        <CablesContainer scrollLeft={scrollLeft} scrollTop={scrollTop} height={racks * 1.5 * RACK_HEIGHT} />
    </Container>;
};

export default Synth;