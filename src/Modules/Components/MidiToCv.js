import React, { useEffect, useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import Select from 'react-select';
import * as actions from '../actions';
import Port from 'Common/Port';
import styles from './styles';
import { useConnections } from '../lib';
import { useAction } from 'storeHelpers';
import { digitalSelectStyle } from 'Common/selectStyles';

const InputSelect = styled(Select)`    
    max-width: 85px;
    margin: 0 5px;
`;

const calculateMidiNoteVolt = note => (note - 69) / 12;

const MIDI_SIGNALS = {
    KEY_ON: 144,
    KEY_OFF: 128,
    PITCH_MOD: 224
}

const MidiToCv = ({ id, audioContext, viewMode }) => {
    const connections = useConnections(id);
    const registerOutputs = useAction(actions.registerOutputs);

    const [midiInputs, setMidiInputs] = useState();
    const [inputOptions, setInputOptions] = useState([]);
    const [selectedInput, setSelectedInput] = useState(null);
    // const [lastNoteOn, setLastNoteOn] = useState();
    let lastNoteOn;

    const module = useMemo(() => {
        if (viewMode) return null;

        const gate = audioContext.createConstantSource();
        gate.offset.value = 0;
        gate.start();

        const cvNote = audioContext.createConstantSource();
        cvNote.offset.value = 0;
        cvNote.start();

        const cvPitch = audioContext.createConstantSource();
        cvPitch.offset.value = 0;
        cvPitch.start();

        const cvVelocity = audioContext.createConstantSource();
        cvVelocity.offset.value = 0;
        cvVelocity.start();

        return { gate, cvNote, cvPitch, cvVelocity };
    }, [audioContext, viewMode]);

    const onMIDIFailure = useCallback(msg => {
        window.alert(`Failed to get MIDI access - ${msg}`);
    }, []);     

    const onMIDIMessage = useCallback(({ data }) => {           
        if (data[0] === MIDI_SIGNALS.KEY_ON) {
            module.gate.offset.value = 1;
            module.cvNote.offset.value = calculateMidiNoteVolt(data[1]);
            module.cvVelocity.offset.value = data[2]/127*5;
            lastNoteOn = data[1];            
        }    
        if (data[0] === MIDI_SIGNALS.KEY_OFF && data[1] === lastNoteOn) {
            module.gate.offset.value = 0;
        }
        if (data[0] === MIDI_SIGNALS.PITCH_MOD) {            
            module.cvPitch.offset.value = ((data[2] << 7) + data[1] - 8192) / 8192 * 2.5;
        }
    }, [module]);

    const onMIDISuccess = useCallback(midiAccess => {
        setMidiInputs(midiAccess.inputs);
        const newInputsOptions = [];
        midiAccess.inputs.forEach(entry => {            
            newInputsOptions.push({ value: entry.name, label: entry.name });
        });
        setInputOptions(newInputsOptions);
    }, [setMidiInputs, setInputOptions]);

    const handleSelectInput = useCallback(({ value }) => {
        console.log(value);
        midiInputs.forEach(entry => {
            if (entry.name === selectedInput)
            {
                entry.onmidimessage = undefined;
            }
            if (entry.name === value)
            {
                entry.onmidimessage = onMIDIMessage;
            }
        })
        setSelectedInput(value);
    }, [midiInputs, selectedInput, setSelectedInput, onMIDIMessage]);

    useEffect(() => {
        if (!module) return;

        registerOutputs(id, {
            Gate: module.gate,
            Note: module.cvNote,
            Pitch: module.cvPitch,
            Velocity: module.cvVelocity
        });
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    }, [id, module, registerOutputs, onMIDIFailure, onMIDISuccess]);

    return <div style={styles.container}>
        <span>Midi-to-CV</span>
        <div style={styles.body}>
            <InputSelect placeholder='Input...' options={inputOptions} onChange={handleSelectInput}
                components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
                styles={digitalSelectStyle}
            />
            <Port portId='Gate' connections={connections} moduleId={id} portType='output' />
            <Port portId='Note' label='CV Note' connections={connections} moduleId={id} portType='output' />
            <Port portId='Pitch' label='CV Pitch' connections={connections} moduleId={id} portType='output' />
            <Port portId='Velocity' label='CV Velocity' connections={connections} moduleId={id} portType='output' />
        </div>
    </div>;
}

MidiToCv.isBrowserSupported = navigator.requestMIDIAccess;
MidiToCv.panelWidth = 6;
MidiToCv.title = `
Midi-to-CV<br/>
Midi/USB-to-CV/Gate interface.<br/>
It has available 4 analog control voltage outputs (CV1...4) and one Gate output.
`;

export default MidiToCv;