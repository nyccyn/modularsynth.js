import React, { Component } from 'react';
import { compose, withState, setStatic } from 'recompose';
import { connect } from 'react-redux';
import { connectModules, registerInputs, registerOutputs } from '../actions';
import Port from '../../Common/Port';
import Knob from '../../Common/Knob';
import { listenToFirstAudioParam } from '../portHelpers';

class SimpleOscillator extends Component {
    constructor(props) {
        super(props);
        if (!props.audioContext) throw new Error("audioContext property must be provided");

        this._oscillator = props.audioContext.createOscillator();
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.handleFrequencyChange = this.handleFrequencyChange.bind(this);
        this.handleVOctChange = this.handleVOctChange.bind(this);
        this.setPitch = this.setPitch.bind(this);
    }

    componentWillMount() {
        const { id, registerInputs, registerOutputs } = this.props;
        this._oscillator.start();
        registerInputs(id, {
            'V/Oct': {
                connect: audioNode => this._cvInterval = listenToFirstAudioParam(audioNode, this.handleVOctChange),
                disconnect: () => {
                    if (this._cvInterval) {
                        clearInterval(this._cvInterval);
                        this._cvInterval = null;
                    }
                    this.handleVOctChange(0);
                }
            }
        });
        registerOutputs(id, {
           Out: this._oscillator
        });
    }

    handleTypeChange({ target: { value }}) {
        this.props.setType(value);
        this._oscillator.type = value;
    }

    handleFrequencyChange(value) {
        this.props.setFrequency(value, this.setPitch);
    }

    handleVOctChange(value) {
        this.props.setVOct(value, this.setPitch);
    }

    setPitch(){
        const { vOct, frequency, audioContext } = this.props;
        const oscFreq = 440 * Math.pow(2, vOct + frequency);
        this._oscillator.frequency.setValueAtTime(oscFreq, audioContext.currentTime);
    }
    
    render() {
        const { id, type, frequency, connections } = this.props;
        return <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>VCO</span>
            Shape:
            <select value={type} onChange={this.handleTypeChange}>
                <option value='sine'>Sine</option>
                <option value='square'>Square</option>
                <option value='sawtooth'>Sawtooth</option>
                <option value='triangle'>Triangle</option>
            </select>
            Freq:
            <Knob min={-2} max={2} step={0.001} value={frequency} onChange={value => this.handleFrequencyChange(value)}/>
            <Port portId='V/Oct' connections={connections} moduleId={id} portType='input'/>
            <Port portId='Out' connections={connections} moduleId={id} portType='output'/>
        </div>;
    }
}

const mapStateToProps = ({ modules }, ownProps) => ({
    connections: modules.connections[ownProps.id]
});

export default compose(
    setStatic('isBrowserSupported', typeof OscillatorNode !== 'undefined'),
    setStatic('panelWidth', 6),
    withState('type', 'setType', 'sine'),
    withState('frequency', 'setFrequency', 0),
    withState('vOct', 'setVOct', 0),
    connect(mapStateToProps, { connectModules, registerInputs, registerOutputs })
)(SimpleOscillator);