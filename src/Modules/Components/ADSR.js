import React, { useState, useEffect, useCallback } from 'react';
import { compose, setStatic } from 'recompose';
import { connect } from 'react-redux';
import { connectModules, registerInputs, registerOutputs } from '../actions';
import Port from '../../Common/Port';
import Knob from '../../Common/Knob';
import { useModule, useListenToFirstAudioParam } from '../lib';
import styles from './styles';

const convertKnobValueToTime = value => Math.pow(value, 4) * 15 + 0.001;

const ADSR = ({ id, audioContext, registerInputs, registerOutputs, connections }) => {

    const [gateAudioNode, setGateAudioNode] = useState(null);
    const [attack, setAttack] = useState(0.5);
    const [decay, setDecay] = useState(0.5);
    const [sustain, setSustain] = useState(0.5);
    const [release, setRelease] = useState(0.5);

    const moduleFactory = useCallback(() => {
        const adsr = audioContext.createConstantSource();
        adsr.offset.value = 0;
        adsr.start();
        return { adsr };
    }, [audioContext]);

    const module = useModule(id, moduleFactory);

    const handleGateInChange = useCallback((value) => {
        if (!module) return;

        const convAttack = convertKnobValueToTime(attack);
        const convDecay = convertKnobValueToTime(decay);
        const convRelease = convertKnobValueToTime(release);       
        const now = audioContext.currentTime;
        const offset = module.adsr.offset;

        if (value === 1) {
            offset.cancelScheduledValues(0);
            offset.linearRampToValueAtTime(0, now + 0.01);
            offset.linearRampToValueAtTime(1, now + convAttack);
            offset.linearRampToValueAtTime(sustain, now + convAttack + convDecay);
        } else if (value === 0) {
            offset.cancelScheduledValues(0);
            offset.setValueAtTime(offset.value, now);
            offset.linearRampToValueAtTime(0, now + convRelease);
        }
    }, [module, attack, decay, sustain, release, audioContext.currentTime]);

    const gateInterval = useListenToFirstAudioParam(gateAudioNode, handleGateInChange);

    useEffect(() => {    
        if (!module) return;

        registerInputs(id, {
            Gate: {
                connect: setGateAudioNode,
                disconnect: () => {
                    setGateAudioNode(null);
                    if (gateInterval) {
                        clearInterval(gateInterval);
                    }
                }
            }
        });
        registerOutputs(id, {
           Out: module.adsr
        });
    }, [module, gateInterval, registerInputs, registerOutputs, id]);

    return <div style={styles.container}>
            <span>ADSR</span>
            <div style={styles.body}>
                Attack:
                <Knob min={0} max={1} step={0.001} value={attack} onChange={value => setAttack(value)} width={30}
                      height={30}/>
                Decay:
                <Knob min={0} max={1} step={0.001} value={decay} onChange={value => setDecay(value)} width={30}
                      height={30}/>
                Sustain:
                <Knob min={0} max={1} step={0.01} value={sustain} onChange={value => setSustain(Number(value))}
                      width={30} height={30}/>
                Release:
                <Knob min={0} max={1} step={0.001} value={release} onChange={value => setRelease(Number(value))}
                      width={30} height={30}/>
                <div style={styles.spaceAround}>
                    <Port portId='Gate' connections={connections} moduleId={id} portType='input'/>
                    <Port portId='Out' connections={connections} moduleId={id} portType='output'/>
                </div>
            </div>
        </div>;
};

const mapStateToProps = ({ modules }, ownProps) => ({
    connections: modules.connections[ownProps.id]
});

export default compose(
    setStatic('isBrowserSupported', typeof ConstantSourceNode !== 'undefined'),
    setStatic('panelWidth', 6),
    connect(mapStateToProps, { connectModules, registerInputs, registerOutputs })
)(ADSR);