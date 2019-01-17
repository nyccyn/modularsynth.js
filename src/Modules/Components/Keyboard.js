import React, { Component } from 'react';
import * as R from 'ramda';
import { compose, setStatic, withState } from 'recompose';
import { connect } from 'react-redux';
import { connectModules, registerOutputs } from '../actions';
import Port from '../../Common/Port';
import styles from './styles';

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


class Keyboard extends Component {
    constructor(props) {
        super(props);
        if (!props.audioContext) throw new Error("audioContext property must be provided");

        this._gate = props.audioContext.createConstantSource();
        this._gate.offset.value = 0;
        this._gate.start();
        this._cv = props.audioContext.createConstantSource();
        this._cv.offset.value = 0;
        this._cv.start();

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleOctaveChange = this.handleOctaveChange.bind(this);
        this.handleKeyboardDown = this.handleKeyboardDown.bind(this);
        this.handleKeyboardUp = this.handleKeyboardUp.bind(this);
        this._keyboardDown = false;
    }

    componentWillMount() {
        const { id, registerOutputs } = this.props;        
        registerOutputs(id, {
            CV: this._cv,
            Gate: this._gate
        });

        document.addEventListener('keydown', this.handleKeyboardDown);
        document.addEventListener('keyup', this.handleKeyboardUp);
    }

    handleKeyboardDown(event) {
        const keyCodeIndex = R.indexOf(event.keyCode, KEY_CODES_NOTES);
        if (!this._keyboardDown && keyCodeIndex !== -1) {
            this._keyboardDown = true;
            this.handleKeyDown(calculateNoteVolt(keyCodeIndex, this.props.octave));
        }
    }

    handleKeyboardUp() {
        this._keyboardDown = false;
        this.handleKeyUp();
    }

    handleKeyDown(cv) {
        this.changeFrequency(cv);
        this._gate.offset.value = 1;
    }

    handleKeyUp() {
        this._gate.offset.value = 0;
    }

    handleOctaveChange({ target: { value }}) {
        const { setOctave, octave } = this.props;
        const newOctave = Number(value);
        const cv = this._cv.offset.value;
        this.changeFrequency(cv + newOctave - octave);
        setOctave(newOctave);
    }

    changeFrequency(cv) {
        this._cv.offset.value = cv;
    }

    render() {
        const { id, connections, octave } = this.props;
        return <div style={styles.container}>
            <span>&#181;Keyboard</span>
            <div style={styles.body}>
                Octave
                <select value={octave} onChange={this.handleOctaveChange}>
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
                                                this.handleKeyDown(calculateNoteVolt(i, octave));
                                            }}
                                            onMouseUp={this.handleKeyUp}
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
    }
}

const mapStateToProps = ({ modules }, ownProps) => ({
    connections: modules.connections[ownProps.id]
});

export default compose(
    setStatic('isBrowserSupported', typeof ConstantSourceNode !== 'undefined'),
    setStatic('panelWidth', 6),
    withState('octave', 'setOctave', 4),
    connect(mapStateToProps, { connectModules, registerOutputs })
)(Keyboard);