import React, { useEffect, useState, useCallback, useMemo } from 'react';
import * as R from 'ramda';
import * as actions from '../actions';
import Port from 'Common/Port';
import Switch from 'Common/Switch';
import styles from './styles';
import { useConnections } from '../lib';
import { useAction } from 'storeHelpers';

const KEY_CODES_NOTES = [90, 83, 88, 68, 67, 86, 71, 66, 72, 78, 74, 77, 188];
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C'];
const BLACK_KEYS_GRID_ROW = {
  'C#': '1/4',
  'D#': '3/6',
  'F#': '6/9',
  'G#': '8/11',
  'A#': '10/13'
};

// The ground oscillation frequency is 440, so we want to send 0 volts when keyboard is in A4
const calculateNoteVolt = (noteIndex, octave) => octave - 5 + (noteIndex + 3) / 12;

const Keyboard = ({ id, audioContext, viewMode }) => {
    const connections = useConnections(id);    
    const registerOutputs = useAction(actions.registerOutputs);

    const [octave, setOctave] = useState(4);
    const [cv, setCv] = useState(0);
    const [keyboardDown, setKeyboardDown] = useState(false);

    const module = useMemo(() => {
        if (viewMode) return null;

        const gate = audioContext.createConstantSource();
        gate.offset.value = 0;
        gate.start();
        const cv = audioContext.createConstantSource();
        cv.offset.value = 0;
        cv.start();

        return { gate, cv };
    }, [audioContext, viewMode]);

    useEffect(() => {
        if (!module) return;

        registerOutputs(id, {
            CV: module.cv,
            Gate: module.gate
        });
    }, [id, module, registerOutputs]);

    useEffect(() => {
        if (module) module.cv.offset.value = cv;
    }, [module, cv]);

    const handleKeyDown = useCallback((cv) => {        
        setCv(cv);
        module.gate.offset.value = 1;
    }, [module]);

    const handleKeyUp = useCallback(() => {
        module.gate.offset.value = 0;
    }, [module]);
    
    const handleKeyboardDown = useCallback((event) => {    
        const keyCodeIndex = R.indexOf(event.keyCode, KEY_CODES_NOTES);
        if (!keyboardDown && keyCodeIndex !== -1) {
            setKeyboardDown(false);
            handleKeyDown(calculateNoteVolt(keyCodeIndex, octave));
        }
    }, [keyboardDown, handleKeyDown, octave]);

    const handleKeyboardUp = useCallback(() => {
        setKeyboardDown(false);
        handleKeyUp();
    }, [handleKeyUp]);

    useEffect(() => {
        if (viewMode) return;
        document.onkeydown = handleKeyboardDown;
        document.onkeyup = handleKeyboardUp;
    }, [handleKeyboardDown, handleKeyboardUp]);

    const handleOctaveChange = useCallback(value => {        
        const cv = module.cv.offset.value;
        setCv(cv + value - octave);
        setOctave(value);
    }, [module, octave]);

    return <div style={styles.container}>
            <span>&#181;Keyboard</span>
            <div style={styles.body}>
                Octave
                <Switch value={octave}
                        onChange={handleOctaveChange}
                        size={60}
                        options={[
                            {value: 2, label: '-2'},
                            {value: 3, label: '-1'},
                            {value: 4, label: '0'},
                            {value: 5, label: '+1'},
                            {value: 6, label: '+2'},
                        ]}/>                
                <div style={{ display: 'grid', flex: 1 }}>
                    {
                        NOTES.map((note, i) => {
                                const isBlackKey = note.endsWith('#');
                                const gridRow = isBlackKey ? BLACK_KEYS_GRID_ROW[note] : i +1;
                                return [
                                    <div key={`TITLE_${note}${i}`} style={{ alignSelf: 'center', gridRow, gridColumn: isBlackKey ? 4 : 1 }}>{note}</div>,
                                    <button key={`${note}${i}`}
                                            onMouseDown={e => {
                                                e.stopPropagation();
                                                handleKeyDown(calculateNoteVolt(i, octave));
                                            }}
                                            onMouseUp={handleKeyUp}
                                            style={{ height:20, width:20,
                                                gridRow,
                                                alignSelf: 'center',
                                                gridColumn: isBlackKey ? 3 : 2,
                                                backgroundColor: isBlackKey ? 'black' : 'white' }}/>
                                ];
                            }
                        )
                    }
                </div>
                <div style={styles.spaceAround}>
                    <Port portId='CV' connections={connections} moduleId={id} portType='output'/>
                    <Port portId='Gate' connections={connections} moduleId={id} portType='output'/>
                </div>
            </div>
        </div>;
};

Keyboard.isBrowserSupported = typeof ConstantSourceNode !== 'undefined';
Keyboard.panelWidth = 8;
Keyboard.title = `
Micro Keyboard<br/>
1 octave micro keyboard and a five-position octave switch.<br/>
Used to generate 1V/Octave CV signal.
`;

export default Keyboard;