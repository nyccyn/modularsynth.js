import React, { Component } from 'react';
import { compose, withState, setStatic } from 'recompose';
import { connect } from 'react-redux';
import { connectModules, registerInputs, registerOutputs } from '../actions';
import Port from './Port';

class SimpleOscillator extends Component {
    constructor(props) {
        super(props);
        if (!props.audioContext) throw new Error("audioContext property must be provided");

        this._oscillator = props.audioContext.createOscillator();
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.handleFrequencyChange = this.handleFrequencyChange.bind(this);
        this.handleVOctChange = this.handleVOctChange.bind(this);
    }

    componentWillMount() {
        const { id, registerInputs, registerOutputs, setVOctConnected } = this.props;
        this._oscillator.start();
        registerInputs(id, {
            'V/Oct': {
                connect: port => {
                    setVOctConnected(true);                    
                    port.onChange = this.handleVOctChange;
                    this.handleVOctChange({ value: port.value });
                },
                disconnect: port => {
                    port.onChange = null;
                    setVOctConnected(false, () => this.handleFrequencyChange(this.props.frequency));
                }
            }
        });
        registerOutputs(id, {
           Out: {
               audioNode: this._oscillator
           }
        });
    }

    handleTypeChange({ target: { value }}) {
        this.props.setType(value);
        this._oscillator.type = value;
    }

    handleFrequencyChange(value) {
        const { setFrequency, vOctConnected } = this.props;
        const newFrequency = Number(value);
        setFrequency(newFrequency);
        if (!vOctConnected) {
            this.handleVOctChange({ value: newFrequency });
        }
    }

    handleVOctChange({ value }) {
        this._oscillator.frequency.setValueAtTime(value, this.props.audioContext.currentTime);
    }
    
    render() {
        const { id, type, frequency, connections } = this.props;
        return <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>
                { id }
            </span>
            Shape:
            <select value={type} onChange={this.handleTypeChange}>
                <option value='sine'>Sine</option>
                <option value='square'>Square</option>
                <option value='sawtooth'>Sawtooth</option>
                <option value='triangle'>Triangle</option>
            </select>
            Freq:
            <input type='range' min={15} max={8000} step={1} value={frequency} onChange={({ target: { value }}) => this.handleFrequencyChange(value)}/>
            V/Oct
            <Port portId='V/Oct' connections={connections} moduleId={id} portType='input'/>
            Out:
            <Port portId='Out' connections={connections} moduleId={id} portType='output'/>
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => ({
    connections: state.connections[ownProps.id]
});

export default compose(
    setStatic('isBrowserSupported', typeof OscillatorNode !== 'undefined'),
    withState('type', 'setType', 'sine'),
    withState('frequency', 'setFrequency', 440),
    withState('vOctConnected', 'setVOctConnected', false),
    connect(mapStateToProps, { connectModules, registerInputs, registerOutputs })
)(SimpleOscillator);