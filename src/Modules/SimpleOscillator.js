import React, { Component } from 'react';
import { compose, withState } from 'recompose';
import { connect } from 'react-redux';
import { connectModules, registerInputs, registerOutputs } from '../actions';
import { getAllInputs, getAllOutputs } from "./selectors";
import Port from './Port';

class SimpleOscillator extends Component {
    constructor(props) {
        super(props);
        if (!props.audioContext) throw new Error("audioContext property must be provided");

        this._oscillator = props.audioContext.createOscillator();
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.handleFrequencyChange = this.handleFrequencyChange.bind(this);
    }

    componentWillMount() {
        const { id, registerInputs, registerOutputs, setVOctConnected } = this.props;
        this._oscillator.start();
        registerInputs(id, {
            'V/Oct': {
                connect: port => {
                    setVOctConnected(true);
                    port.onChange = this.handleVOctChange;
                },
                disconnect: () => {
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
            this.handleVOctChange(newFrequency);
        }
    }

    handleVOctChange(frequency) {
        this._oscillator.frequency.setValueAtTime(frequency, this.props.audioContext.currentTime);
    }
    
    render() {
        const { id, type, frequency, connections, possibleInputs } = this.props;
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
            <input type='range' min={15} max={8000} step={1} value={frequency} onChange={({ target: { value }}) => this.handleFrequencyChange(value)}/>
            Out:
            <Port portId='Out' connections={connections} possiblePorts={possibleInputs} moduleId={id} portType='output'/>
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => ({
    connections: state.connections[ownProps.id],
    possibleInputs: getAllInputs(state),
    possibleOutputs: getAllOutputs(state)
});

export default compose(
    withState('type', 'setType', 'sine'),
    withState('frequency', 'setFrequency', 440),
    withState('vOctConnected', 'setVOctConnected', false),
    connect(mapStateToProps, { connectModules, registerInputs, registerOutputs })
)(SimpleOscillator);