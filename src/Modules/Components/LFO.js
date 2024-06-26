import React, { useState, useEffect, useMemo } from 'react';
import * as R from 'ramda';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DroppedSaw } from '@mohayonao/wave-tables';
import * as actions from '../actions';
import Port from 'Common/Port';
import LABEL_POSITIONS from 'Common/LabelPositions';
import Knob from 'Common/Knob';
import Switch from "Common/Switch";
import { Container, Grid, GridCell } from './styles';
import { useAction } from 'storeHelpers';

const createOscillator = (audioContext, type) => {
    const oscillator = audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = 0;
    return oscillator;
};

const FREQ_RANGE = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH'
};

const mapIndexed = R.addIndex(R.map);

const OSCILLATOR_TYPES = {
    Sawtooth: 'Sawtooth',
    RevSawtooth: 'RevSawtooth',
    Sine: 'Sine',
    Triangle: 'Triangle',
    Pulse: 'Pulse'
};

const LFO = ({ id, audioContext, viewMode }) => {
    const registerOutputs = useAction(actions.registerOutputs);
    const [frequency, setFrequency] = useState(0);
    const [range, setRange] = useState(FREQ_RANGE.LOW);

    const module = useMemo(() => {
        if (viewMode) return null;

        const pulse = audioContext.createPulseOscillator();
        pulse.frequency.value = 0;
        pulse.width.value = 0;
        const oscillators = {
            [OSCILLATOR_TYPES.Sawtooth]: createOscillator(audioContext, 'sawtooth'),
            [OSCILLATOR_TYPES.RevSawtooth]: createOscillator(audioContext, 'sine'),
            [OSCILLATOR_TYPES.Sine]: createOscillator(audioContext, 'sine'),
            [OSCILLATOR_TYPES.Triangle]: createOscillator(audioContext, 'triangle'),
            [OSCILLATOR_TYPES.Pulse]: pulse,
        };
        const revSawtoothWave = audioContext.createPeriodicWave(DroppedSaw.real, DroppedSaw.imag);
        oscillators[OSCILLATOR_TYPES.RevSawtooth].setPeriodicWave(revSawtoothWave);

        const frequencyControl = audioContext.createConstantSource();
        frequencyControl.offset.value = 0;
        R.forEachObjIndexed(o => frequencyControl.connect(o.frequency))(oscillators);
        R.forEachObjIndexed(o => o.start())(oscillators);
        frequencyControl.start();

        return { oscillators, frequencyControl };
    }, [audioContext, viewMode]);

    useEffect(() => {
        if (!module) return;

        registerOutputs(id, {
            Sawtooth: module.oscillators.Sawtooth,
            [OSCILLATOR_TYPES.RevSawtooth]: module.oscillators[OSCILLATOR_TYPES.RevSawtooth],
            [OSCILLATOR_TYPES.Sine]: module.oscillators[OSCILLATOR_TYPES.Sine],
            [OSCILLATOR_TYPES.Triangle]: module.oscillators[OSCILLATOR_TYPES.Triangle],
            [OSCILLATOR_TYPES.Pulse]: module.oscillators[OSCILLATOR_TYPES.Pulse]
        });
    }, [module, id, registerOutputs]);

    useEffect(() => {
        if (!module) return;

        let newFreq;
        switch (range) {
            case FREQ_RANGE.LOW:
                newFreq = Math.pow(2, frequency) * 4.995 + 0.005;
                break;
            case FREQ_RANGE.MEDIUM:
                newFreq = Math.pow(2, frequency) * 49.9 + 0.1;
                break;
            case FREQ_RANGE.HIGH:
            default:
                newFreq = Math.pow(2, frequency) * 4490 + 10;
                break;
        }
        module.frequencyControl.offset.value = newFreq;
    }, [module, frequency, range]);

    return <Container>
        <span>LFO</span>
        <Grid $marginTop={15}>
            {
                R.pipe(
                    R.keys,
                    R.take(4),
                    mapIndexed((osc, i) =>
                        <GridCell key={osc} $column={1} $row={i + 1}>
                            <Port label={''} portId={osc} moduleId={id} portType='output' />
                        </GridCell>
                    )
                )(OSCILLATOR_TYPES)
            }
            <GridCell $column={1} $row={5}>
                <Port portId={[OSCILLATOR_TYPES.Pulse]} moduleId={id} portType='output'
                    label={<img width={25} src={require(`./pulse.svg`)} alt='Pulse' />}
                    labelPosition={LABEL_POSITIONS.BELOW} />
            </GridCell>

            {
                R.pipe(
                    R.keys,
                    R.take(4),
                    mapIndexed((osc, i) =>
                        [
                            <GridCell key={osc + 'arrow'} $column={2} $row={i + 1}>
                                <FontAwesomeIcon size='xs' icon='arrow-left' />
                            </GridCell>,
                            <GridCell key={osc} $column={3} $row={i + 1}>
                                <img width={25} src={require(`./${osc.toLowerCase()}.svg`)} alt={osc} />
                            </GridCell>
                        ]
                    )
                )(OSCILLATOR_TYPES)
            }
            <GridCell $column='2/4' $row={5}>
                <Knob label='Frequ.' min={-4} max={4} step={0.001} value={frequency} width={30} height={30} onChange={setFrequency} />
            </GridCell>
            <GridCell $column='1/4' $row={6}>
                <Switch value={range}
                    onChange={setRange}
                    options={[
                        { value: FREQ_RANGE.LOW, label: 'L' },
                        { value: FREQ_RANGE.MEDIUM, label: 'M' },
                        { value: FREQ_RANGE.HIGH, label: 'H' }
                    ]}
                />
                Frequ.<br />
                Range
            </GridCell>
        </Grid>
    </Container>;
};

LFO.isBrowserSupported = typeof OscillatorNode !== 'undefined' && typeof ConstantSourceNode !== 'undefined';
LFO.panelWidth = 8;
LFO.title = `
LFO<br/>
Low frequency oscillator<br/>
Produces cyclical control voltages in a very wide range of frequencies.<br/>
Five waveforms are available:<br/>
sawtooth, inverted sawtooth, triangle, sine and square wave.
`;

export default LFO;