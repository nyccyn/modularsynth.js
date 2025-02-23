import React, { useEffect, useMemo, useState } from 'react';
import * as actions from '../actions';
import Port from 'Common/Port';
import Knob from 'Common/Knob';
import styles from './styles';
import { useConnections } from '../lib';
import { useAction } from 'storeHelpers';

const VCA = ({ id, audioContext, viewMode }) => {    
    const connections = useConnections(id);
    const registerInputs = useAction(actions.registerInputs);
    const registerOutputs = useAction(actions.registerOutputs);

    const [gain, setGain] = useState(1);
    const [cv2, setCv2] = useState(0);
    const [in1, setIn1] = useState(1);
    const [in2, setIn2] = useState(1);
    const [out, setOut] = useState(1);

    const module = useMemo(() => {
        if (viewMode) return null;

        const gain = audioContext.createGain();
        const gainVolume = audioContext.createGain();
        const input1Gain = audioContext.createGain();
        const input2Gain = audioContext.createGain();
        const cv2 = audioContext.createConstantSource()
        const cv2Gain = audioContext.createGain();
        const outputGain = audioContext.createGain();

        input1Gain.connect(gain);
        input2Gain.connect(gain);

        cv2.offset.value = 0;
        cv2.start();
        cv2.connect(cv2Gain);
        cv2Gain.gain.value = 0;
        cv2Gain.connect(gain.gain);

        gain.connect(gainVolume).connect(outputGain);

        return { input1Gain, input2Gain, cv2, cv2Gain, gainVolume, outputGain, gain };
    }, [audioContext, viewMode]);    

    useEffect(() => {
        if (!module) return;
        window.vca = module;

        registerInputs(id, {
            AudioIn1: {
                connect: audioNode => audioNode.connect(module.input1Gain),            
                disconnect: audioNode => audioNode.disconnect(module.input1Gain)
            },
            AudioIn2: {
                connect: audioNode => audioNode.connect(module.input2Gain),            
                disconnect: audioNode => audioNode.disconnect(module.input2Gain)
            },
            CV1: {
                connect: audioNode => {
                    module.gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.01);
                    return audioNode.connect(module.gain.gain);
                },
                disconnect: audioNode => {                
                    module.gain.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
                    audioNode.disconnect(module.gain.gain);

                    // Workaround:
                    // If the connected audio node is being disconnected before finishing its changes (etc. linearRampToValueAtTime in release phase)
                    // it won't effect any more
                    if (audioNode.offset) {
                        audioNode.offset.value = 0;
                    }
                }
            },
            CV2: {
                connect: audioNode => {
                    module.gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.01);
                    return audioNode.connect(module.cv2.offset);
                },
                disconnect: audioNode => {                
                    module.gain.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
                    audioNode.disconnect(module.cv2.offset);

                    // Workaround:
                    // If the connected audio node is being disconnected before finishing its changes (etc. linearRampToValueAtTime in release phase)
                    // it won't effect any more
                    if (audioNode.offset) {
                        audioNode.offset.value = 0;
                    }
                }
            }
        });
        registerOutputs(id, {
            AudioOut: module.outputGain
        });
    }, [module, id, registerInputs, registerOutputs, audioContext]);

    useEffect(() => {
        if (!module) return;
        module.gainVolume.gain.value = gain;
    }, [module, gain]);

    useEffect(() => {
        if (!module) return;
        module.cv2Gain.gain.value = cv2;
    }, [module, cv2]);

    useEffect(() => {
        if (!module) return;
        module.input1Gain.gain.value = in1;
    }, [module, in1]);

    useEffect(() => {
        if (!module) return;
        module.input2Gain.gain.value = in2;
    }, [module, in2]);

    useEffect(() => {
        if (!module) return;
        module.outputGain.gain.value = out;
    }, [module, out]);

    return <div style={styles.container}>
        <span>VCA</span>
        <div style={{ ...styles.spaceAround, flex: 1 }}>
            <div style={{ ...styles.spaceAround, flexDirection: 'column' }}>
                <Port portId='CV1' connections={connections} moduleId={id} portType='input' />
                <Port portId='CV2' connections={connections} moduleId={id} portType='input' />
                <Port portId='AudioIn1' connections={connections} moduleId={id} portType='input' />
                <Port portId='AudioIn2' connections={connections} moduleId={id} portType='input' /> 
                <Port portId='AudioOut' connections={connections} moduleId={id} portType='output' />
            </div>
            <div style={{ ...styles.spaceAround, flexDirection: 'column' }}>
                Gain
                <Knob min={0} max={2} step={0.02} value={gain} width={30} height={30} onChange={setGain} />
                CV 2
                <Knob min={0} max={1} step={0.01} value={cv2} width={30} height={30} onChange={setCv2} />
                In 1
                <Knob min={0} max={1} step={0.01} value={in1} width={30} height={30} onChange={setIn1} />
                In 2
                <Knob min={0} max={1} step={0.01} value={in2} width={30} height={30} onChange={setIn2} />
                Out
                <Knob min={0} max={1} step={0.01} value={out} width={30} height={30} onChange={setOut} />
            </div>
        </div>
    </div>;
};

VCA.isBrowserSupported = typeof GainNode !== 'undefined';
VCA.panelWidth = 8;
VCA.title = `
Linear VCA<br/>
Voltage Controlled Amplifiers<br/>
The VCA has two audio inputs, each with an attenuator.<br/>
They are amplified by an amount determined<br/>
by the combination of the gain and the two CV controls.
`;

export default VCA;