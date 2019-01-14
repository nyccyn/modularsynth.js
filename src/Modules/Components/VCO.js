import React, { Component } from 'react';
import { compose, withState, setStatic } from 'recompose';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { connectModules, registerInputs, registerOutputs } from '../actions';
import Port, { LABEL_POSITIONS } from '../../Common/Port';
import Knob from '../../Common/Knob';


const createOscillator = (audioContext, type) => {
    const oscillator = audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = 0;
    return oscillator;
};

class VCO extends Component {
    constructor(props) {
        super(props);
        const{ audioContext } = props;
        if (!audioContext) throw new Error('audioContext property must be provided');

        const pulse = audioContext.createPulseOscillator();
        pulse.frequency.value = 0;
        pulse.width.value = 0;
        this._oscillators = {
            Sawtooth: createOscillator(audioContext, 'sawtooth'),
            Pulse: pulse,
            Triangle: createOscillator(audioContext, 'triangle'),
            Sine: createOscillator(audioContext, 'sine'),
        };
        window.pulse = this._oscillators.Pulse;
        window['sine' + props.id] = this._oscillators.Sine;


        this._frequencyControl = audioContext.createVoltToHzConverter(440, 2);
        this._detuneControl = audioContext.createConstantSource();
        this._frequencyControl.volt.value = 0;
        this._detuneControl.offset.value = 0;

        this._fmGain = audioContext.createGain();
        this._fmGain.gain.value = 0;
        this._fmGain.connect(this._frequencyControl.volt);
        R.forEachObjIndexed(o => this._frequencyControl.connect(o.frequency))(this._oscillators);
        R.forEachObjIndexed(o => this._detuneControl.connect(o.detune))(this._oscillators);

        this._pwCvGain = audioContext.createGain();
        this._pwCvGain.gain.value = 0;
        this._pwCvGain.connect(this._oscillators.Pulse.width);
        window.pwm = this._pwCvGain;

        this.handleFrequencyChange = this.handleFrequencyChange.bind(this);
        this.handleTuneChange = this.handleTuneChange.bind(this);
        this.handlePwChange = this.handlePwChange.bind(this);
        this.handlePwmCvChange = this.handlePwmCvChange.bind(this);
        this.handleFmCvChange = this.handleFmCvChange.bind(this);
    }

    componentWillMount() {
        const { id, registerInputs, registerOutputs } = this.props;
        this.startNodes();
        registerInputs(id, {
            'V/Oct': {
                connect: audioNode => audioNode.connect(this._frequencyControl.volt),
                disconnect: audioNode => audioNode.disconnect(this._frequencyControl.volt)
            },
            'PWM': {
                connect: audioNode => audioNode.connect(this._pwCvGain),
                disconnect: audioNode => audioNode.disconnect(this._pwCvGain)
            },
            'FM': {
                connect: audioNode => audioNode.connect(this._fmGain),
                disconnect: audioNode => audioNode.disconnect(this._fmGain)
            }
        });
        registerOutputs(id, {
            Sawtooth: this._oscillators.Sawtooth,
            Pulse: this._oscillators.Pulse,
            Triangle: this._oscillators.Triangle,
            Sine: this._oscillators.Sine
        });
    }

    handleFrequencyChange(value) {
        this.props.setFrequency(value);
        this._frequencyControl.offset.value = value;
    }

    handleTuneChange(value) {
        this.props.setTune(value);
        this._detuneControl.offset.value = value;
    }

    handlePwChange(value) {
        this.props.setPw(value);
        this._oscillators.Pulse.width.value = value;
    }

    handlePwmCvChange(value) {
        this.props.setPwmCv(value);
        this._pwCvGain.gain.value = value / 10;
    }

    handleFmCvChange(value) {
        this.props.setFmCv(value);
        this._fmGain.gain.value = value;
    }

    startNodes() {
        R.forEachObjIndexed(o => o.start())(this._oscillators);
        this._frequencyControl.start();
        this._detuneControl.start();
    }
    
    render() {
        const { id, frequency, tune, pw, pwmCv, fmCv } = this.props;
        return <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <span>VCO</span>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
                    <Port portId='V/Oct' moduleId={id} portType='input'/>
                    <Port portId='FM' moduleId={id} portType='input'/>
                    <Port portId='PWM' moduleId={id} portType='input'/>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Knob label='Range' min={-2} max={2} step={0.001} value={frequency} width={30} height={30} onChange={this.handleFrequencyChange}/>
                    <Knob label='Tune' min={-600} max={600} step={1} value={tune} width={30} height={30} onChange={this.handleTuneChange}/>
                    <Knob label='FM CV' min={0} max={1} step={0.005} value={fmCv} width={30} height={30} onChange={this.handleFmCvChange}/>
                    <Knob label='PW' min={-1} max={1} step={0.001} value={pw} width={30} height={30} onChange={this.handlePwChange}/>
                    <Knob label='PWM CV' min={0} max={1} step={0.005} value={pwmCv} width={30} height={30} onChange={this.handlePwmCvChange}/>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                {
                    R.pipe(
                        R.keys,
                        R.map(osc =>
                            <Port key={osc} label={<img width={25} src={require(`./${osc.toLowerCase()}.svg`)} alt={osc}/>}
                                  labelPosition={LABEL_POSITIONS.BELOW} portId={osc} moduleId={id} portType='output'/>)
                    )(this._oscillators)
                }
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
    withState('pwmCv', 'setPwmCv', 0),
    withState('fmCv', 'setFmCv', 0),
    withState('vOct', 'setVOct', 0),
    connect(null, { connectModules, registerInputs, registerOutputs })
)(VCO);