import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as R from 'ramda';
import * as actions from '../actions';
import Port from 'Common/Port';
import LABEL_POSITIONS from 'Common/LabelPositions';
import Knob from 'Common/Knob';
import { Container, Body, SpaceAround, Grid, GridCell } from './styles';
import { useAction } from 'storeHelpers';

const createOscillator = (audioContext, type) => {
    const oscillator = audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = 0;
    return oscillator;
};

const OSCILLATOR_TYPES = {
    Sawtooth: 'Sawtooth',
    Pulse: 'Pulse',
    Triangle: 'Triangle',
    Sine: 'Sine'
};

const VCO = ({ id, audioContext, viewMode }) => {
    const registerInputs = useAction(actions.registerInputs);
    const registerOutputs = useAction(actions.registerOutputs);

    const [frequency, setFrequency] = useState(0);
    const [tune, setTune] = useState(0);
    const [pw, setPw] = useState(0);
    const [pwmCv2, setPwmCv2] = useState(0);
    const [fmCv, setFmCv] = useState(0);

    const module = useMemo(() => {
        if (viewMode) return null;

        const pulse = audioContext.createPulseOscillator();
        pulse.frequency.value = 0;
        pulse.width.value = 0;
        const oscillators = {
            Sawtooth: createOscillator(audioContext, 'sawtooth'),
            Pulse: pulse,
            Triangle: createOscillator(audioContext, 'triangle'),
            Sine: createOscillator(audioContext, 'sine'),
        };

        const frequencyControl = audioContext.createVoltToHzConverter(440, 4);
        const detuneControl = audioContext.createConstantSource();
        frequencyControl.volt.value = 0;
        detuneControl.offset.value = 0;

        const cv2Gain = audioContext.createGain();
        cv2Gain.gain.value = 0;
        cv2Gain.connect(frequencyControl.volt);
        R.forEachObjIndexed(o => frequencyControl.connect(o.frequency))(oscillators);
        R.forEachObjIndexed(o => detuneControl.connect(o.detune))(oscillators);

        const pwCvGain2 = audioContext.createGain();
        pwCvGain2.gain.value = 0;
        pwCvGain2.connect(oscillators.Pulse.width);

        R.forEachObjIndexed(o => o.start())(oscillators);
        frequencyControl.start();
        detuneControl.start();

        return { oscillators, frequencyControl, detuneControl, cv2Gain, pwCvGain2 };
    }, [audioContext, viewMode]);

    useEffect(() => {
        if (!module) return;

        registerInputs(id, {
            'CV1': {
                connect: audioNode => audioNode.connect(module.frequencyControl.volt),
                disconnect: audioNode => audioNode.disconnect(module.frequencyControl.volt)
            },
            'PWCV1': {
                connect: audioNode => audioNode.connect(module.oscillators.Pulse.width),
                disconnect: audioNode => audioNode.disconnect(module.oscillators.Pulse.width)
            },
            'PWCV2': {
                connect: audioNode => audioNode.connect(module.pwCvGain2),
                disconnect: audioNode => audioNode.disconnect(module.pwCvGain2)
            },
            'CV2': {
                connect: audioNode => audioNode.connect(module.cv2Gain),
                disconnect: audioNode => audioNode.disconnect(module.cv2Gain)
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
        module.frequencyControl.volt.value = value;
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
        setPwmCv2(value);
        module.pwCvGain2.gain.value = value;
    }, [module]);

    const handleFmCvChange = useCallback((value) => {
        setFmCv(value);
        module.cv2Gain.gain.value = value;
    }, [module]);

    return <Container>
        <span style={{ marginBottom:4 }}>VCO</span>
        <Body>
            <Grid $gridTemplateRows='22px auto'>
                <GridCell $column={1} $row={2}>
                    <Port portId='CV1' moduleId={id} portType='input' />
                </GridCell>
                <GridCell $column={1} $row={3}>
                    <Port portId='CV2' moduleId={id} portType='input' />
                </GridCell>
                <GridCell $column={1} $row={4}>
                    <Port portId='PWCV1' moduleId={id} portType='input' />
                </GridCell>
                <GridCell $column={1} $row={5}>
                    <Port portId='PWCV2' moduleId={id} portType='input' />
                </GridCell>

                <GridCell $column={2} $row={1}>
                    <Knob label='Range' labelPosition={LABEL_POSITIONS.RIGHT} min={-4} max={4} step={1} value={frequency} width={20} height={20} onChange={handleFrequencyChange} />
                </GridCell>
                <GridCell $column='2/4' $row={2}>
                    <Knob label='Tune' min={-600} max={600} step={1} value={tune} width={30} height={30} onChange={handleTuneChange} />
                </GridCell>
                <GridCell $column='2/4' $row={3}>
                    <Knob label='CV2' min={0} max={1} step={0.005} value={fmCv} width={30} height={30} onChange={handleFmCvChange} />
                </GridCell>
                <GridCell $column='2/4' $row={4}>
                    <Knob label='PW' min={-1} max={1} step={0.001} value={pw} width={30} height={30} onChange={handlePwChange} />
                </GridCell>
                <GridCell $column='2/4' $row={5}>
                    <Knob label='PW CV2' min={0} max={1} step={0.005} value={pwmCv2} width={30} height={30} onChange={handlePwmCvChange} />
                </GridCell>
            </Grid>             
            <SpaceAround>
                {
                    R.pipe(
                        R.keys,
                        R.map(osc =>
                            <Port key={osc} label={<img width={25} src={require(`./${osc.toLowerCase()}.svg`)} alt={osc} />}
                                labelPosition={LABEL_POSITIONS.BELOW} portId={osc} moduleId={id} portType='output' />)
                    )(OSCILLATOR_TYPES)
                }
            </SpaceAround>
        </Body>
    </Container>;
};

VCO.isBrowserSupported = typeof OscillatorNode !== 'undefined' && typeof ConstantSourceNode !== 'undefined';
VCO.panelWidth = 10;
VCO.title = `
Standard VCO<br/>
Voltage Controlled Oscillator<br/>
It can produce four waveforms simultaneously:<br/>
rectangle, sawtooth, triangle, and sine wave
`

export default VCO;