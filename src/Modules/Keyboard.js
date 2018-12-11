import React, { Component } from 'react';
import * as R from 'ramda';
import { compose, setStatic, withState } from 'recompose';
import { connect } from 'react-redux';
import { connectModules, registerOutputs } from '../actions';
import Port from './Port';

const KEY_CODES_NOTES = [90, 83, 88, 68, 67, 86, 71, 66, 72, 78, 74, 77, 188];
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C'];

// The ground oscillation frequency is 440, so we want to send 0 volts when keyboard is in A4
const calculateNoteVolt = (noteIndex, octave) => octave - 5 + (noteIndex + 3) / 12;


class Keyboard extends Component {
    constructor(props) {
        super(props);
        this._cvOutPort = {
            onChange: null,
            value: props.cv
        };
        this._gateOutPort = {
            onChange: null
        };
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
            CV: this._cvOutPort,
            Gate: this._gateOutPort
        });
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
        if (this._gateOutPort.onChange) { 
            this._gateOutPort.onChange(1);
        }
    }

    handleKeyUp() {
        if (this._gateOutPort.onChange) { 
            this._gateOutPort.onChange(0);
        }
    }

    handleOctaveChange({ target: { value }}) {
        const { setOctave, octave, cv } = this.props;
        const newOctave = Number(value);
        this.changeFrequency(cv + newOctave - octave);
        setOctave(newOctave);
    }

    changeFrequency(cv) {
        this.props.setCv(cv);
        this._cvOutPort.value = cv;
        if (this._cvOutPort.onChange) {
            this._cvOutPort.onChange({ value: cv });
        }
    }

    render() {
        const { id, connections, octave } = this.props;
        return <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>{id}</span>
            CV:
            <Port portId='CV' connections={connections} moduleId={id} portType='output'/>
            Gate:
            <Port portId='Gate' connections={connections} moduleId={id} portType='output'/>
            Octave:
            <select value={octave} onChange={this.handleOctaveChange}>
                <option value={2}>-2</option>
                <option value={3}>-1</option>
                <option value={4}>0</option>
                <option value={5}>+1</option>
                <option value={6}>+2</option>
            </select>
            <div style={{ display: 'flex' }} tabIndex={0} onKeyDown={this.handleKeyboardDown} onKeyUp={this.handleKeyboardUp}>
                {
                    NOTES.map((note, i) =>
                        <button key={`${note}${i}`} onMouseDown={() => this.handleKeyDown(calculateNoteVolt(i, octave))} onMouseUp={this.handleKeyUp}>{note}</button>
                    )
                }
            </div>
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => ({
    connections: state.connections[ownProps.id]
});

export default compose(
    setStatic('isBrowserSupported', true),
    withState('cv', 'setCv', 0),
    withState('octave', 'setOctave', 4),
    connect(mapStateToProps, { connectModules, registerOutputs })
)(Keyboard);