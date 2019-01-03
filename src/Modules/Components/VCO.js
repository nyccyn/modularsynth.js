import React, { Component } from 'react';
import { compose, withState, setStatic } from 'recompose';
import { connect } from 'react-redux';
import { connectModules, registerInputs, registerOutputs } from '../actions';
import Port from '../../Common/Port';
import Knob from '../../Common/Knob';
import { listenToFirstAudioParam } from '../portHelpers';

class VCO extends Component {
    constructor(props) {
        super(props);
        if (!props.audioContext) throw new Error('audioContext property must be provided');

        this._sineOscillator = props.audioContext.createOscillator();
        this._sineOscillator.frequency.value = 0;
        this._sawtoothOscillator = props.audioContext.createOscillator();
        this._sawtoothOscillator.type = 'sawtooth';
        this._sawtoothOscillator.frequency.value = 0;
        this._pulseOscillator = props.audioContext.createPulseOscillator();
        window.pulse = this._pulseOscillator;
        this._pulseOscillator.frequency.value = 0;
        this._pulseOscillator.width.value = 0;
        this._triangleOscillator = props.audioContext.createOscillator();
        this._triangleOscillator.type = 'triangle';
        this._triangleOscillator.frequency.value = 0;

        this._frequencyControl = props.audioContext.createConstantSource();
        this._frequencyControl.offset.value = 440;
        this._vOctInput = props.audioContext.createWaveShaper();

        this.handleFrequencyChange = this.handleFrequencyChange.bind(this);
        this.handleTuneChange = this.handleTuneChange.bind(this);
        this.handleVOctChange = this.handleVOctChange.bind(this);
        this.handlePwChange = this.handlePwChange.bind(this);
        this.setPitch = this.setPitch.bind(this);
    }

    componentWillMount() {
        const { id, registerInputs, registerOutputs } = this.props;
        this.initNodes();
        registerInputs(id, {
            'V/Oct': {
                connect: audioNode => {
                    audioNode.connect(this._vOctInput);
                    this._cvInterval = listenToFirstAudioParam(audioNode, this.handleVOctChange);
                },
                disconnect: audioNode => {
                    audioNode.disconnect(this._vOctInput);
                    if (this._cvInterval) {
                        clearInterval(this._cvInterval);
                        this._cvInterval = null;
                    }
                    this.handleVOctChange(0);
                }
            }
        });
        registerOutputs(id, {
            Sawtooth: this._sawtoothOscillator,
            Square: this._pulseOscillator,
            Triangle: this._triangleOscillator,
            Sine: this._sineOscillator
        });
    }

    handleFrequencyChange(value) {
        this.props.setFrequency(value, this.setPitch);
    }

    handleTuneChange(value) {
        this.props.setTune(value, this.setPitch);
    }

    handlePwChange(value) {
        this.props.setPw(value);
        this._pulseOscillator.width.value = value;
    }

    initNodes() {
        this._frequencyControl.connect(this._sineOscillator.frequency);
        this._frequencyControl.connect(this._sawtoothOscillator.frequency);
        this._frequencyControl.connect(this._pulseOscillator.frequency);
        this._frequencyControl.connect(this._triangleOscillator.frequency);
        this._vOctInput.connect(this._frequencyControl.offset);
        this._sineOscillator.start();
        this._sawtoothOscillator.start();
        this._pulseOscillator.start();
        this._triangleOscillator.start();
        this._frequencyControl.start();
    }

    handleVOctChange(value) {
        this.props.setVOct(value, this.setPitch);
    }

    setPitch(){
        const { vOct, frequency, tune, audioContext } = this.props;
        const oscFreq = 440 * Math.pow(2, vOct + frequency + tune);
        this._frequencyControl.offset.setValueAtTime(oscFreq, audioContext.currentTime);
    }
    
    render() {
        const { id, frequency, tune, pw } = this.props;
        return <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>VCO</span>
            Range:
            <Knob min={-2} max={2} step={0.001} value={frequency} onChange={this.handleFrequencyChange}/>
            Tune:
            <Knob min={-0.5} max={0.5} step={0.001} value={tune} width={30} height={30} onChange={this.handleTuneChange}/>
            PW:
            <Knob min={-0.5} max={0.5} step={0.001} value={pw} width={30} height={30} onChange={this.handlePwChange}/>
            <Port portId='V/Oct' moduleId={id} portType='input'/>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <Port title='|\' portId='Sawtooth' moduleId={id} portType='output'/>
                <Port title='|-|_' portId='Square' moduleId={id} portType='output'/>
                <Port title='/\' portId='Triangle' moduleId={id} portType='output'/>
                <Port title='§' portId='Sine' moduleId={id} portType='output'/>
            </div>
        </div>;
    }
}

export default compose(
    setStatic('isBrowserSupported', typeof OscillatorNode !== 'undefined'),
    setStatic('panelWidth', 8),
    withState('frequency', 'setFrequency', 0),
    withState('tune', 'setTune', 0),
    withState('pw', 'setPw', 0),
    withState('vOct', 'setVOct', 0),
    connect(null, { connectModules, registerInputs, registerOutputs })
)(VCO);