import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import * as R from 'ramda';
import * as actions from '../actions';
import Port from 'Common/Port';
import Knob from 'Common/Knob';
import Switch from 'Common/Switch';
import { useConnections } from '../lib';
import { useAction } from 'storeHelpers';
import { Container, Body, Grid, GridCell } from './styles';
import LABEL_POSITIONS from 'Common/LabelPositions';

const MAX_STEPS = 8;

const STEP_MODES = {
    REPEAT: 'REPEAT',
    STEP: 'STEP',
    SINGLE: 'SINGLE'
};

const CHANNEL_MODES = {
    PARALLEL: 'PARALLEL',
    SERIES: 'SERIES'
}

function convertTempoToSeconds(tempo, sampleRate) {
    // Constants
    const maxValue = 6;
    const minValue = 1 / sampleRate;
    const inputMin = -5;
    const inputMax = 5;

    // Scale and shift the input to fit the range from 0 to 1
    const scaledTempo = (tempo - inputMin) / (inputMax - inputMin);

    // Calculate the exponential function
    return maxValue * Math.pow(minValue / maxValue, scaledTempo);
}

class SequencerModule {
    clock;
    gate;
    cv1;
    cv2;
    trigIn;
    trigOut;
    channelFrequencies;
    tempo;
    delay;
    gateTime;
    stepMode;
    channelMode;
    stepNumber;

    #audioContext;
    #playingStep = 0;
    #currentChannel = 0;
    #playing;

    constructor(audioContext, onStepChanged) {
        this.#audioContext = audioContext;
        this.clock = audioContext.createClock();
        this.clock.parameters.get("tempo").setValueAtTime(-2.5, audioContext.currentTime);
        this.clock.onTick = this.#onClockTick.bind(this);
        this.gate = audioContext.createConstantSource();
        this.gate.offset.value = 0;
        this.gate.start();
        this.cv1 = audioContext.createConstantSource();
        this.cv1.offset.value = 0;
        this.cv1.start();
        this.cv2 = audioContext.createConstantSource();
        this.cv2.offset.value = 0;
        this.cv2.start();
        this.trigIn = audioContext.createGate();
        this.trigIn.gateChange = this.#onTrigInChange.bind(this);
        this.trigOut = audioContext.createConstantSource();
        this.trigOut.offset.value = 0;
        this.trigOut.start();

        this.onStepChanged = onStepChanged;
    }

    #play() {        
        const maxSteps = this.channelMode === CHANNEL_MODES.PARALLEL || this.#currentChannel === 1 ?
            this.stepNumber : MAX_STEPS;
        const isLastStep = this.#playingStep >= maxSteps;
        const newPlayingStep = isLastStep ? 1 : this.#playingStep + 1;
        this.#setPlayingStep(newPlayingStep);

        const now = this.#audioContext.currentTime;
        const tempoInSecs = convertTempoToSeconds(this.tempo, this.#audioContext.sampleRate);

        const cv1CurrentChannel = this.channelMode === CHANNEL_MODES.PARALLEL ? 0 : this.#currentChannel;
        this.cv1.offset.linearRampToValueAtTime(this.channelFrequencies[cv1CurrentChannel][this.#playingStep - 1], now + this.delay)
        this.cv2.offset.linearRampToValueAtTime(this.channelFrequencies[1][this.#playingStep - 1], now + this.delay);

        this.gate.offset.setValueAtTime(1, now);
        this.gate.offset.setValueAtTime(0, now + tempoInSecs * this.gateTime);
        this.trigOut.offset.setValueAtTime(1, now);
        this.trigOut.offset.setValueAtTime(0, now + 0.1);

        if (isLastStep && this.channelMode === CHANNEL_MODES.SERIES) {
            this.#currentChannel = this.#currentChannel === 0 ? 1 : 0;
        } else if (this.channelMode === CHANNEL_MODES.PARALLEL) {
            this.#currentChannel = 0;
        }

        if (this.stepMode === STEP_MODES.STEP ||
            (this.stepMode === STEP_MODES.SINGLE && isLastStep)) {
            this.#playing = false;
            this.clock.play(false);
        }
    }

    #setPlayingStep(newStep) {
        this.#playingStep = newStep;
        this.onStepChanged(newStep);
    }

    #onClockTick() {
        if (!this.trigIn.inputConnected) {
            this.#play();
        }
    }

    #onTrigInChange(value) {
        if (value === 1) {
            this.#play();
        }
    }

    startStop() {
        this.#playing = !this.#playing;
        this.clock.play(this.#playing);

        if (!this.#playing && this.stepMode !== STEP_MODES.STEP) {
            this.#setPlayingStep(0);
        }
    }
}

const Led = ({ on, label }) =>
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    }}>
        {label}
        <div style={{ backgroundColor: on ? 'red' : 'grey', width: 5, height: 5, borderRadius: 50 }} />
    </div>;

const Sequencer = ({ id, audioContext, viewMode, ...otherProps }) => {
    const connections = useConnections(id);
    const registerInputs = useAction(actions.registerInputs);
    const registerOutputs = useAction(actions.registerOutputs);

    const [channelFrequencies, setChannelFrequencies] = useState(otherProps.channelFrequencies || R.repeat(R.repeat(0, 8), 2));
    const [tempo, setTempo] = useState(-2.5);
    const [delay, setDelay] = useState(0);
    const [gateTime, setGateTime] = useState(5);
    const [stepNumber, setStepNumber] = useState(otherProps.stepNumber || 2);
    const [stepMode, setStepMode] = useState(STEP_MODES.REPEAT);
    const [channelMode, setChannelMode] = useState(otherProps.channelMode || CHANNEL_MODES.PARALLEL);
    const [playingStep, setPlayingStep] = useState(1);

    const module = useMemo(() => {
        if (viewMode) return null;

        return new SequencerModule(audioContext, setPlayingStep);
    }, [audioContext, viewMode, setPlayingStep]);

    useEffect(() => {
        if (!module) return;        
        module.channelFrequencies = channelFrequencies;
    }, [module, channelFrequencies]);

    useEffect(() => {
        if (!module) return;
        module.tempo = tempo;
    }, [module, tempo]);

    useEffect(() => {
        if (!module) return;
        module.delay = delay;
    }, [module, delay]);

    useEffect(() => {
        if (!module) return;
        module.gateTime = gateTime;
    }, [module, gateTime]);

    useEffect(() => {
        if (!module) return;
        module.stepNumber = stepNumber;
    }, [module, stepNumber]);

    useEffect(() => {
        if (!module) return;
        module.stepMode = stepMode;
    }, [module, stepMode]);

    useEffect(() => {
        if (!module) return;
        module.channelMode = channelMode;
    }, [module, channelMode]);

    useEffect(() => {
        if (!module) return;

        registerInputs(id, {
            TrigIn: {
                connect: audioNode => {
                    module.trigIn.inputConnected = true;
                    audioNode.connect(module.trigIn);
                },
                disconnect: audioNode => {
                    module.trigIn.inputConnected = false;
                    audioNode.disconnect(module.trigIn);
                }
            },
            TempoCv: {
                connect: audioNode => audioNode.connect(module.clock.parameters.get("tempoCv")),
                disconnect: audioNode => audioNode.disconnect(module.clock.parameters.get("tempoCv"))
            }
        });

        registerOutputs(id, {
            CV1: module.cv1,
            CV2: module.cv2,
            Gate: module.gate,
            TrigOut: module.trigOut
        });
    }, [id, module, registerOutputs, registerInputs]);

    const handleFrequencyChange = useCallback((channel, step, value) => {
        setChannelFrequencies(R.assocPath([channel, step], value, channelFrequencies));
    }, [channelFrequencies, setChannelFrequencies]);

    const changeTempo = useCallback(value => {
        setTempo(value);
        if (module) {
            module.clock.parameters.get("tempo").setValueAtTime(value, audioContext.currentTime);
        }
    }, [module, setTempo, audioContext]);

    const handleStartStop = useCallback(e => {
        e.stopPropagation();
        e.preventDefault();

        if (!module) return;

        module.startStop();
    }, [module]);

    return <Container>
        <span style={{ marginBottom: 4 }}>Sequencer</span>
        <Body style={{ height: '100%' }}>
            <Grid $gridTemplateColumns='49.5% 1% 49.5%' style={{ height: '100%' }}>
                <GridCell $column={1} $row={1} style={{ height: '85%' }}>
                    <Grid $gridTemplateRows='repeat(8, 1fr)' style={{ height: '100%' }}>
                        {
                            R.times(step => <Fragment key={`step${step}`}>
                                <GridCell $column={1} $row={step + 1}>
                                    <Knob min={-10} max={10} step={0.01} value={channelFrequencies[0][step]} width={20} height={20} onChange={value => handleFrequencyChange(0, step, value)} />
                                </GridCell>
                                <GridCell $column={2} $row={step + 1}>
                                    <Led label={step + 1} on={playingStep === step + 1} />
                                </GridCell>
                                <GridCell $column={3} $row={step + 1}>
                                    <Knob min={-5} max={5} step={0.01} value={channelFrequencies[1][step]} width={20} height={20} onChange={value => handleFrequencyChange(1, step, value)} />
                                </GridCell>
                            </Fragment>, MAX_STEPS)
                        }
                    </Grid>
                </GridCell>
                <GridCell $column={2} $row={1} style={{ height: '85%', backgroundColor: 'grey' }} />
                <GridCell $column={3} $row={1} style={{ height: '85%' }}>
                    <Grid $gridTemplateRows='1fr 2fr 1fr 1fr 1fr 3fr' style={{ height: '97%' }}>
                        <GridCell $row={1} style={{ margin: '0 4px' }}>
                            <Grid $gridTemplateColumns='1fr 1fr 1fr'>
                                <Knob label='Tempo' labelStyle={{ fontSize: 8 }} min={-4} max={-1} step={0.001} value={tempo} width={20} height={20} onChange={changeTempo} />
                                <Knob label='Delay' labelStyle={{ fontSize: 8 }} min={0} max={10} step={0.5} value={delay} width={20} height={20} onChange={setDelay} />
                                <Knob label='Gate Time' labelStyle={{ fontSize: 8 }} min={0.1} max={0.9} step={0.01} value={gateTime} width={20} height={20} onChange={setGateTime} />
                            </Grid>
                        </GridCell>

                        <GridCell $row={2} style={{ marginTop: 2 }}>
                            <Knob label='Step Number' labelStyle={{ fontSize: 14 }} labelPosition={LABEL_POSITIONS.BELOW} min={1} max={8} step={1} value={stepNumber} width={35} height={35} onChange={setStepNumber} />
                        </GridCell>

                        <GridCell $row={3}>
                            <Switch value={stepMode}
                                labelSize={100}
                                onChange={setStepMode}
                                options={[
                                    { value: STEP_MODES.REPEAT, label: 'Repeat' },
                                    { value: STEP_MODES.STEP, label: 'Step' },
                                    { value: STEP_MODES.SINGLE, label: 'Single' }
                                ]}
                            />
                        </GridCell>
                        <GridCell $row={4} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: 14 }}>Start/Stop</span>
                            <button onClick={handleStartStop}
                                style={{
                                    backgroundColor: 'red',
                                    width: 20,
                                    height: 20,
                                    borderRadius: 100
                                }}></button>
                        </GridCell>
                        <GridCell $row={5}>
                            <Switch value={channelMode}
                                labelSize={120}
                                onChange={setChannelMode}
                                options={[
                                    { value: CHANNEL_MODES.PARALLEL, label: 'Parallel' },
                                    { value: CHANNEL_MODES.SERIES, label: 'Series' }
                                ]}
                            />
                        </GridCell>
                        <Grid $row={6} $gridTemplateRows='1fr 1fr 1fr' $gridTemplateColumns='1fr 1fr'>
                            <GridCell $column={1} $row={1}>
                                <Port portId='CV1' labelStyle={{ fontSize: 10 }} connections={connections} moduleId={id} portType='output' />
                            </GridCell>
                            <GridCell $column={2} $row={1}>
                                <Port portId='CV2' labelStyle={{ fontSize: 10 }} connections={connections} moduleId={id} portType='output' />
                            </GridCell>
                            <GridCell $column={1} $row={2}>
                                <Port portId='Gate' labelStyle={{ fontSize: 10 }} connections={connections} moduleId={id} portType='output' />
                            </GridCell>
                            <GridCell $column={2} $row={2}>
                                <Port portId='TempoCv' labelStyle={{ fontSize: 10 }} label='Tempo CV' connections={connections} moduleId={id} portType='input' />
                            </GridCell>
                            <GridCell $column={1} $row={3}>
                                <Port portId='TrigOut' labelStyle={{ fontSize: 10 }} label='Trig Out' connections={connections} moduleId={id} portType='output' />
                            </GridCell>
                            <GridCell $column={2} $$row={3}>
                                <Port portId='TrigIn' labelStyle={{ fontSize: 10 }} label='Trig In' connections={connections} moduleId={id} portType='input' />
                            </GridCell>
                        </Grid>
                    </Grid>
                </GridCell>
            </Grid>
        </Body>
    </Container>;
}

Sequencer.isBrowserSupported = typeof ConstantSourceNode !== 'undefined';
Sequencer.panelWidth = 16;
Sequencer.title = `
Sequencer<br/>
A 2-channel 8-step analog sequencer<br/>
with each with its own control voltage knob<br/>
and global Tempo, Delay and Gate time Adjustments.
`

export default Sequencer;