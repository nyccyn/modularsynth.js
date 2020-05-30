import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as actions from '../actions';
import Port from 'Common/Port';
import Knob from 'Common/Knob';
import { useConnections } from '../lib';
import { Grid, GridCell, Container } from './styles';
import { useAction } from 'storeHelpers';
import Switch from "Common/Switch";

 const TIME_RANGE = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH'
};

const convertKnobValueToTime = (value, range) => {    
    switch (range) {
        case TIME_RANGE.LOW:
            return Math.pow(value, 4) * 0.0001 + 0.000001;
        case TIME_RANGE.MEDIUM:
            return Math.pow(value, 4) * 2 + 0.000401;            
        case TIME_RANGE.HIGH:
        default:
            return Math.pow(value, 4) * 120 + 0.020001;
    }
}

const ADSR = ({ id, audioContext, viewMode }) => {
    const connections = useConnections(id);
    const registerInputs = useAction(actions.registerInputs);
    const registerOutputs = useAction(actions.registerOutputs);

    const [gate, setGate] = useState(0);
    const [attack, setAttack] = useState(0.5);
    const [decay, setDecay] = useState(0.5);
    const [sustain, setSustain] = useState(0.5);
    const [release, setRelease] = useState(0.5);
    const [range, setRange] = useState(TIME_RANGE.MEDIUM);

    const module = useMemo(() => {
        if (viewMode) return null;

        const adsr = audioContext.createConstantSource();
        const inverese = audioContext.createConstantSource();
        const gate = audioContext.createGate();
        const retrigger = audioContext.createGate();
        adsr.offset.value = 0;
        adsr.start();
        inverese.offset.value = 0;
        inverese.start();
        return { adsr, inverese, gate, retrigger };
    }, [audioContext, viewMode]);    

    const generateEnvelope = useCallback(value => {
        if (!module) return;
        
        const convAttack = convertKnobValueToTime(attack, range) + 0.01;
        const convDecay = convertKnobValueToTime(decay, range);
        const convRelease = convertKnobValueToTime(release, range);
        const now = audioContext.currentTime;
        const adsrOffset = module.adsr.offset;
        const invereseOffset = module.inverese.offset;

        if (value === 1) {            
            adsrOffset.cancelScheduledValues(now);
            adsrOffset.setValueAtTime(adsrOffset.value, now);
            adsrOffset.linearRampToValueAtTime(1, now + convAttack);
            adsrOffset.linearRampToValueAtTime(sustain, now + convAttack + convDecay);

            invereseOffset.cancelScheduledValues(now);
            invereseOffset.setValueAtTime(invereseOffset.value, now);
            invereseOffset.linearRampToValueAtTime(-1, now + convAttack);
            invereseOffset.linearRampToValueAtTime(-1 * sustain, now + convAttack + convDecay);
        } else if (value === 0) {
            adsrOffset.cancelScheduledValues(now);
            adsrOffset.setValueAtTime(adsrOffset.value, now);
            adsrOffset.linearRampToValueAtTime(0, now + convRelease);

            invereseOffset.cancelScheduledValues(now);
            invereseOffset.setValueAtTime(invereseOffset.value, now);
            invereseOffset.linearRampToValueAtTime(0, now + convRelease);
        }
    }, [module, attack, decay, sustain, release, audioContext, range]);

    const handleGateInChange = useCallback(value => {                
        setGate(value);
        generateEnvelope(value);
    }, [generateEnvelope]);

    const hadnleRetrigger = useCallback(value => {
        if (gate === 1)
        {
            generateEnvelope(value);
        }
    }, [gate, generateEnvelope]);

    useEffect(() => {
        if (!module) return;
        module.gate.gateChange = handleGateInChange;
    }, [module, handleGateInChange]);
    useEffect(() => {
        if (!module) return;
        module.retrigger.gateChange = hadnleRetrigger;
    }, [module, hadnleRetrigger]);

    useEffect(() => {
        if (!module) return;
        window.adsr = module;
        registerInputs(id, {
            Gate: {
                connect: audioNode => audioNode.connect(module.gate),
                disconnect: audioNode => audioNode.disconnect(module.gate)
            },
            Retrigger: {
                connect: audioNode => audioNode.connect(module.retrigger),
                disconnect: audioNode => audioNode.disconnect(module.retrigger)
            }
        });
        registerOutputs(id, {
            Out1: module.adsr,
            Out2: module.adsr,
            Inverse: module.inverese
        });
    }, [module, registerInputs, registerOutputs, id]);

    return <Container>
        <span>ADSR</span>
        <Grid>
            <GridCell column={1} row={1}>
                <Port portId='Gate' connections={connections} moduleId={id} portType='input' />
            </GridCell>
            <GridCell column={1} row={2}>    
                <Port label='Retrig.' portId='Retrigger' connections={connections} moduleId={id} portType='input' />            
            </GridCell>
            <GridCell column={1} row={3}>
                <Port label='Output' portId='Out1' connections={connections} moduleId={id} portType='output' />
            </GridCell>
            <GridCell column={1} row={4}>
                <Port label='Output' portId='Out2' connections={connections} moduleId={id} portType='output' />
            </GridCell>
            <GridCell column={1} row={5}>
                <Port label='Inverse Output' portId='Inverse' connections={connections} moduleId={id} portType='output' />
            </GridCell>

            <GridCell column={2} row={1}>
                <Knob min={0} max={1} step={0.001} value={attack} label='A'
                    onChange={setAttack}
                    width={30} height={30} />
            </GridCell>
            <GridCell column={2} row={2}>
                <Knob min={0} max={1} step={0.001} value={decay} label='D'
                    onChange={setDecay}
                    width={30} height={30} />
            </GridCell>
            <GridCell column={2} row={3}>
                <Knob min={0} max={1} step={0.01} value={sustain} label='S'
                    onChange={setSustain}
                    width={30} height={30} />
            </GridCell>
            <GridCell column={2} row={4}>
                <Knob min={0} max={1} step={0.001} value={release} label='R'
                    onChange={setRelease}
                    width={30} height={30} />
            </GridCell>
            <GridCell column={2} row={5}>                
                <Switch value={range}
                        onChange={setRange}
                        options={[
                            { value: TIME_RANGE.LOW, label: 'L' },
                            { value: TIME_RANGE.MEDIUM, label: 'M' },
                            { value: TIME_RANGE.HIGH, label: 'H' }
                        ]}
                />
                Time<br />
                Range
            </GridCell>
        </Grid>
    </Container>;
};

ADSR.isBrowserSupported = typeof ConstantSourceNode !== 'undefined';
ADSR.panelWidth = 8;
ADSR.title = `
ADSR<br/>
Envelope Generator<br/>
The shape of the envelope is governed by four parameters:<br/>
Attack, Decay, Sustain and Release.<br/>
As soon as the gate input receives sufficient voltage,<br/>
the ADSR generates a variable voltage, changing in time, called an envelope.
`;

export default ADSR;