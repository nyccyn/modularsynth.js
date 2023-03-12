import React, { useEffect, useMemo, useState } from 'react';
import * as actions from '../actions';
import Port from 'Common/Port';
import Knob from 'Common/Knob';
import styles from './styles';
import { useConnections } from '../lib';
import { useAction } from 'storeHelpers';

const Mixer = ({ id, audioContext, viewMode }) => {    
    const connections = useConnections(id);
    const registerInputs = useAction(actions.registerInputs);
    const registerOutputs = useAction(actions.registerOutputs);
    
    const [in1, setIn1] = useState(1);
    const [in2, setIn2] = useState(1);
    const [in3, setIn3] = useState(1);
    const [in4, setIn4] = useState(1);
    const [out, setOut] = useState(1);

    const module = useMemo(() => {
        if (viewMode) return null;
        
        const input1Gain = audioContext.createGain();
        const input2Gain = audioContext.createGain();
        const input3Gain = audioContext.createGain();
        const input4Gain = audioContext.createGain();
        const outputGain = audioContext.createGain();

        input1Gain.connect(outputGain);
        input2Gain.connect(outputGain);
        input3Gain.connect(outputGain);
        input4Gain.connect(outputGain);
    

        return { input1Gain, input2Gain, input3Gain, input4Gain, outputGain };
    }, [audioContext, viewMode]);    

    useEffect(() => {
        if (!module) return;        

        registerInputs(id, {
            Input1: {
                connect: audioNode => audioNode.connect(module.input1Gain),            
                disconnect: audioNode => audioNode.disconnect(module.input1Gain)
            },
            Input2: {
                connect: audioNode => audioNode.connect(module.input2Gain),            
                disconnect: audioNode => audioNode.disconnect(module.input2Gain)
            },
            Input3: {
                connect: audioNode => audioNode.connect(module.input3Gain),            
                disconnect: audioNode => audioNode.disconnect(module.input1Gain)
            },
            Input4: {
                connect: audioNode => audioNode.connect(module.input4Gain),            
                disconnect: audioNode => audioNode.disconnect(module.input2Gain)
            },
        });
        registerOutputs(id, {
            Output: module.outputGain
        });
    }, [module, id, registerInputs, registerOutputs, audioContext]);
    

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
        module.input3Gain.gain.value = in3;
    }, [module, in3]);

    useEffect(() => {
        if (!module) return;
        module.input4Gain.gain.value = in4;
    }, [module, in4]);

    useEffect(() => {
        if (!module) return;
        module.outputGain.gain.value = out;
    }, [module, out]);

    return <div style={styles.container}>
        <span>Mixer</span>
        <div style={{ ...styles.spaceAround, flex: 1 }}>
            <div style={{ ...styles.spaceAround, flexDirection: 'column' }}>                
                <Port portId='Input1' connections={connections} moduleId={id} portType='input' />
                <Port portId='Input2' connections={connections} moduleId={id} portType='input' /> 
                <Port portId='Input3' connections={connections} moduleId={id} portType='input' />
                <Port portId='Input4' connections={connections} moduleId={id} portType='input' /> 
                <Port portId='Output' connections={connections} moduleId={id} portType='output' />
            </div>
            <div style={{ ...styles.spaceAround, flexDirection: 'column' }}>                
                In 1
                <Knob min={0} max={1} step={0.01} value={in1} width={30} height={30} onChange={setIn1} />
                In 2
                <Knob min={0} max={1} step={0.01} value={in2} width={30} height={30} onChange={setIn2} />
                In 3
                <Knob min={0} max={1} step={0.01} value={in3} width={30} height={30} onChange={setIn3} />
                In 4
                <Knob min={0} max={1} step={0.01} value={in4} width={30} height={30} onChange={setIn4} />
                Out
                <Knob min={0} max={1} step={0.01} value={out} width={30} height={30} onChange={setOut} />
            </div>
        </div>
    </div>;
};

Mixer.isBrowserSupported = typeof GainNode !== 'undefined';
Mixer.panelWidth = 8;
Mixer.title = `
Linear Mixer<br/>
A four channel mixer,<br/>
which can be used with either control voltages or audio signals.<br/>
`;

export default Mixer;