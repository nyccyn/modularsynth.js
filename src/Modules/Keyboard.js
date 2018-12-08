import React, { Component } from 'react';
import { compose, setStatic, withState } from 'recompose';
import { connect } from 'react-redux';
import { connectModules, registerOutputs } from '../actions';
import Port from './Port';

const KEYCODE_FREQ = {
    90: 261.63,
    83: 277.18,
    88: 293.66,
    68: 311.13,
    67: 329.63,
    86: 349.23,
    71: 369.99,
    66: 392.00,
    72: 415.30,
    78: 440.00,
    74: 466.16,
    77: 493.88,
    188: 523.25
};

class Keyboard extends Component {
    constructor(props) {
        super(props);
        this._cvOutPort = {
            onChange: null,
            value: props.frequency
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
        if (!this._keyboardDown && KEYCODE_FREQ[event.keyCode]) {
            this._keyboardDown = true;
            this.handleKeyDown(KEYCODE_FREQ[event.keyCode] * this.props.octave);
        }
    }

    handleKeyboardUp() {
        this._keyboardDown = false;
        this.handleKeyUp();
    }

    handleKeyDown(frequency) {
        this.changeFrequency(frequency);
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
        const { setOctave, octave, frequency } = this.props;
        const newOctave = Number(value);        
        this.changeFrequency(frequency * newOctave / octave);
        setOctave(newOctave);
    }

    changeFrequency(frequency) {
        this.props.setFrequency(frequency);
        this._cvOutPort.value = frequency;
        if (this._cvOutPort.onChange) {
            this._cvOutPort.onChange({ value: frequency });
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
            <select value={octave} onChange={this.handleOctaveChange}>
                <option value={0.25}>-2</option>
                <option value={0.5}>-1</option>
                <option value={1}>0</option>
                <option value={2}>+1</option>
                <option value={3}>+2</option>
            </select>
            <div style={{ display: 'flex' }} onKeyDown={this.handleKeyboardDown} onKeyUp={this.handleKeyboardUp} tabIndex={0}>
                <button onMouseDown={() => this.handleKeyDown(261.63 * octave)} onMouseUp={this.handleKeyUp}>C</button>
                <button onMouseDown={() => this.handleKeyDown(277.18 * octave)} onMouseUp={this.handleKeyUp}>C#</button>
                <button onMouseDown={() => this.handleKeyDown(293.66 * octave)} onMouseUp={this.handleKeyUp}>D</button>
                <button onMouseDown={() => this.handleKeyDown(311.13 * octave)} onMouseUp={this.handleKeyUp}>D#</button>
                <button onMouseDown={() => this.handleKeyDown(329.63 * octave)} onMouseUp={this.handleKeyUp}>E</button>
                <button onMouseDown={() => this.handleKeyDown(349.23 * octave)} onMouseUp={this.handleKeyUp}>F</button>
                <button onMouseDown={() => this.handleKeyDown(369.99 * octave)} onMouseUp={this.handleKeyUp}>F#</button>
                <button onMouseDown={() => this.handleKeyDown(392.00 * octave)} onMouseUp={this.handleKeyUp}>G</button>
                <button onMouseDown={() => this.handleKeyDown(415.30 * octave)} onMouseUp={this.handleKeyUp}>G#</button>
                <button onMouseDown={() => this.handleKeyDown(440.00 * octave)} onMouseUp={this.handleKeyUp}>A</button>
                <button onMouseDown={() => this.handleKeyDown(466.16 * octave)} onMouseUp={this.handleKeyUp}>A#</button>
                <button onMouseDown={() => this.handleKeyDown(493.88 * octave)} onMouseUp={this.handleKeyUp}>B</button>
                <button onMouseDown={() => this.handleKeyDown(523.25 * octave)} onMouseUp={this.handleKeyUp}>C</button>
            </div>
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => ({
    connections: state.connections[ownProps.id]
});

export default compose(
    setStatic('isBrowserSupported', true),
    withState('frequency', 'setFrequency', 440),
    withState('octave', 'setOctave', 1),
    connect(mapStateToProps, { connectModules, registerOutputs })
)(Keyboard);