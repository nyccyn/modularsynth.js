import React, { useEffect, useState, useCallback } from 'react';
import * as R from 'ramda';
import * as actions from '../actions';
import Port from '../../Common/Port';
import styles from './styles';
import { useModule, useConnections } from '../lib';
import { useAction } from '../../storeHelpers';

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

const Keyboard = ({ id, audioContext }) => {
    const connections = useConnections(id);    
    const registerOutputs = useAction(actions.registerOutputs);

    const [octave, setOctave] = useState(4);
    const [cv, setCv] = useState(0);
    const [keyboardDown, setKeyboardDown] = useState(false);

    const moduleFactory = useCallback(() => {
        const gate = audioContext.createConstantSource();
        gate.offset.value = 0;
        gate.start();
        const cv = audioContext.createConstantSource();
        cv.offset.value = 0;
        cv.start();

        return { gate, cv };
    }, [audioContext]);
    const module = useModule(id, moduleFactory);

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
        document.onkeydown = handleKeyboardDown;
        document.onkeyup = handleKeyboardUp;
    }, [handleKeyboardDown, handleKeyboardUp]);

    const handleOctaveChange = useCallback(({ target: { value }}) => {
        const newOctave = Number(value);
        const cv = module.cv.offset.value;
        setCv(cv + newOctave - octave);
        setOctave(newOctave);
    }, [module, octave]);

    return <div style={styles.container}>
            <span>&#181;Keyboard</span>
            <div style={styles.body}>
                Octave
                <select value={octave} onChange={handleOctaveChange}>
                    <option value={2}>-2</option>
                    <option value={3}>-1</option>
                    <option value={4}>0</option>
                    <option value={5}>+1</option>
                    <option value={6}>+2</option>
                </select>
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
Keyboard.panelWidth = 6;

export default Keyboard;