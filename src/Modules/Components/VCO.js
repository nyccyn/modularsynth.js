import React, { useState, useEffect, useCallback } from 'react';
import { compose, setStatic } from 'recompose';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { connectModules, registerInputs, registerOutputs } from '../actions';
import Port, { LABEL_POSITIONS } from '../../Common/Port';
import Knob from '../../Common/Knob';
import styles from './styles';
import { useModule } from '../lib';

const createOscillator = (audioContext, type) => {
    const oscillator = audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = 0;
    return oscillator;
};

const VCO = ({ id, audioContext, registerInputs, registerOutputs }) => {
    const [frequency, setFrequency] = useState(0);
    const [tune, setTune] = useState(0);
    const [pw, setPw] = useState(0);
    const [pwmCv, setPwmCv] = useState(0);
    const [fmCv, setFmCv] = useState(0);    
    
    const moduleFactory = useCallback(() => {
        const pulse = audioContext.createPulseOscillator();
        pulse.frequency.value = 0;
        pulse.width.value = 0;
        const oscillators = {
            Sawtooth: createOscillator(audioContext, 'sawtooth'),
            Pulse: pulse,
            Triangle: createOscillator(audioContext, 'triangle'),
            Sine: createOscillator(audioContext, 'sine'),
        };

        const frequencyControl = audioContext.createVoltToHzConverter(440, 2);
        const detuneControl = audioContext.createConstantSource();
        frequencyControl.volt.value = 0;
        detuneControl.offset.value = 0;

        const fmGain = audioContext.createGain();
        fmGain.gain.value = 0;
        fmGain.connect(frequencyControl.volt);
        R.forEachObjIndexed(o => frequencyControl.connect(o.frequency))(oscillators);
        R.forEachObjIndexed(o => detuneControl.connect(o.detune))(oscillators);

        const pwCvGain = audioContext.createGain();
        pwCvGain.gain.value = 0;
        pwCvGain.connect(oscillators.Pulse.width);

        R.forEachObjIndexed(o => o.start())(oscillators);
        frequencyControl.start();
        detuneControl.start();

        return { oscillators, frequencyControl, detuneControl, fmGain, pwCvGain };
    }, [audioContext]);

    const module = useModule(id, moduleFactory);

    useEffect(() => {
        if (!module) return;

        registerInputs(id, {
            'V/Oct': {
                connect: audioNode => audioNode.connect(module.frequencyControl.volt),
                disconnect: audioNode => audioNode.disconnect(module.frequencyControl.volt)
            },
            'PWM': {
                connect: audioNode => audioNode.connect(module.pwCvGain),
                disconnect: audioNode => audioNode.disconnect(module.pwCvGain)
            },
            'FM': {
                connect: audioNode => audioNode.connect(module.fmGain),
                disconnect: audioNode => audioNode.disconnect(module.fmGain)
            }
        });
        registerOutputs(id, {
            Sawtooth: module.oscillators.Sawtooth,
            Pulse: module.oscillators.Pulse,
            Triangle: module.oscillators.Triangle,
            Sine: module.oscillators.Sine
        });
    }, [module, id, registerInputs, registerOutputs]);

    const handleFrequencyChange = useCallback((value) => {
        setFrequency(value);
        module.frequencyControl.offset.value = value;
    }, [module]);

    const handleTuneChange = useCallback((value) => {
        setTune(value);
        module.detuneControl.offset.value = value;
    }, [module]);

    const handlePwChange = useCallback((value) => {
        setPw(value);
        module.oscillators.Pulse.width.value = value;
    }, [module]);

    const handlePwmCvChange = useCallback((value) => {
        setPwmCv(value);
        module.pwCvGain.gain.value = value / 10;
    }, [module]);

    const handleFmCvChange = useCallback((value) => {
        setFmCv(value);
        module.fmGain.gain.value = value;
    }, [module]);

    return <div style={styles.container}>
            <span>VCO</span>
            <div style={{ ...styles.body, justifyContent: 'space-between' }}>
                <div style={styles.spaceAround}>
                    <div style={{ ...styles.spaceAround, flexDirection: 'column' }}>
                        <Port portId='V/Oct' moduleId={id} portType='input'/>
                        <Port portId='FM' moduleId={id} portType='input'/>
                        <Port portId='PWM' moduleId={id} portType='input'/>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Knob label='Range' min={-2} max={2} step={0.001} value={frequency} width={30} height={30} onChange={handleFrequencyChange}/>
                        <Knob label='Tune' min={-600} max={600} step={1} value={tune} width={30} height={30} onChange={handleTuneChange}/>
                        <Knob label='FM CV' min={0} max={1} step={0.005} value={fmCv} width={30} height={30} onChange={handleFmCvChange}/>
                        <Knob label='PW' min={-1} max={1} step={0.001} value={pw} width={30} height={30} onChange={handlePwChange}/>
                        <Knob label='PWM CV' min={0} max={1} step={0.005} value={pwmCv} width={30} height={30} onChange={handlePwmCvChange}/>
                    </div>
                </div>
                <div style={styles.spaceAround}>
                    {
                        module && R.pipe(
                            R.keys,
                            R.map(osc =>
                                <Port key={osc} label={<img width={25} src={require(`./${osc.toLowerCase()}.svg`)} alt={osc}/>}
                                      labelPosition={LABEL_POSITIONS.BELOW} portId={osc} moduleId={id} portType='output'/>)
                        )(module.oscillators)
                    }
                </div>
            </div>
        </div>;
};

export default compose(
    setStatic('isBrowserSupported', typeof OscillatorNode !== 'undefined' && typeof ConstantSourceNode !== 'undefined'),
    setStatic('panelWidth', 8),
    connect(null, { connectModules, registerInputs, registerOutputs })
)(VCO);