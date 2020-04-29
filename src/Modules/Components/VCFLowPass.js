import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as actions from '../actions';
import Port from '../../Common/Port';
import Knob from '../../Common/Knob';
import { useConnections } from '../lib';
import { useAction } from '../../storeHelpers';
import styles from './styles';

const QUAL_MUL = 30;

const VCFLowPass = ({ id, audioContext }) => {
    const connections = useConnections(id);
    const registerInputs = useAction(actions.registerInputs);
    const registerOutputs = useAction(actions.registerOutputs);

    const [frequency, setFrequency] = useState(0.5);
    const [q, setQ] = useState(0.1);
    const [cv2Gain, setCv2Gain] = useState(0.5);
    const [cv3Gain, setCv3Gain] = useState(0.5);

    const module = useMemo(() => {
        const vcf = audioContext.createBiquadFilter();
        const cv = audioContext.createVoltToHzConverter(440, 2);
        const cv2 = audioContext.createVoltToHzConverter(440, 2);
        const cv3 = audioContext.createVoltToHzConverter(440, 2);
        const cv2Gain = audioContext.createGain();
        const cv3Gain = audioContext.createGain();

        cv.volt.value = 0;
        cv.start();
        cv.connect(vcf.frequency);

        cv2.volt.value = 0;
        cv2.start();
        cv2.connect(cv2Gain);
        cv2Gain.gain.value = 0.5;
        cv2Gain.connect(vcf.frequency);

        cv3.volt.value = 0;
        cv3.start();
        cv3.connect(cv3Gain);
        cv3Gain.gain.value = 0.5;
        cv3Gain.connect(vcf.frequency);

        vcf.type = 'lowpass';
        vcf.Q.value = 0.5;
        return { vcf, cv, cv2, cv3, cv2Gain, cv3Gain };
    }, [audioContext]);

    useEffect(() => {
        if (!module) return;
        window.vcf = module;

        registerInputs(id, {
            In: {
                connect: audioNode => audioNode.connect(module.vcf),
                disconnect: audioNode => audioNode.disconnect(module.vcf)
            },
            CV1: {
                connect: audioNode => audioNode.connect(module.cv.volt),
                disconnect: audioNode => audioNode.disconnect(module.cv.volt)
            },
            CV2: {
                connect: audioNode => audioNode.connect(module.cv2.volt),
                disconnect: audioNode => audioNode.disconnect(module.cv2.volt)
            },
            CV3: {
                connect: audioNode => audioNode.connect(module.cv3.volt),
                disconnect: audioNode => audioNode.disconnect(module.cv3.volt)
            }
        });
        registerOutputs(id, {
            Out: module.vcf
        });
    }, [module, id, registerInputs, registerOutputs]);

    useEffect(() => {
        if (!module) return;

        const minValue = 40;
        const maxValue = audioContext.sampleRate / 2;
        // Logarithm (base 2) to compute how many octaves fall in the range.
        const numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
        // Compute a multiplier from 0 to 1 based on an exponential scale.
        const multiplier = Math.pow(2, numberOfOctaves * (frequency - 1.0));
        // Get back to the frequency value between min and max.
        module.vcf.frequency.setValueAtTime(maxValue * multiplier, audioContext.currentTime);
    }, [module, frequency, audioContext]);

    const handleFrequencyChange = useCallback((value) => {
        setFrequency(Number(value));
    }, []);

    useEffect(() => {
        if (!module) return;
        module.vcf.Q.value = q * QUAL_MUL;        
    }, [module, q])

    const handleQChange = useCallback((value) => {
        setQ(Number(value));
    }, []);

    useEffect(() => {
        if (!module) return;
        module.cv2Gain.gain.value = cv2Gain;
    }, [module, cv2Gain]);

    const handleCv2GainChange = useCallback(value => {
        setCv2Gain(Number(value));
    }, []);

    useEffect(() => {
        if (!module) return;
        module.cv3Gain.gain.value = cv3Gain;
    }, [module, cv3Gain]);

    const handleCv3GainChange = useCallback(value => {
        setCv3Gain(Number(value));
    }, []);

    return <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <span style={{ display: 'flex', flexDirection: 'column' }}>
            VCF
            <span style={{ fontSize: 10 }}>LOW PASS FILTER</span>
        </span>
        <div style={{ ...styles.spaceAround, flex: 1 }}>
            <div style={{ ...styles.spaceAround, flexDirection: 'column' }}>
                <Port portId='CV1' connections={connections} moduleId={id} portType='input' />
                <Port portId='CV2' connections={connections} moduleId={id} portType='input' />
                <Port portId='CV3' connections={connections} moduleId={id} portType='input' />
                <Port portId='In' connections={connections} moduleId={id} portType='input' />
                <Port portId='Out' connections={connections} moduleId={id} portType='output' />
            </div>
            <div style={{ ...styles.spaceAround, flexDirection: 'column' }}>
                Frequency
                <Knob min={0} max={1} step={0.01} value={frequency} width={30} height={30} onChange={value => handleFrequencyChange(value)} />
                CV 2
                <Knob min={0} max={1} step={0.01} value={cv2Gain} width={30} height={30} onChange={value => handleCv2GainChange(value)} />
                CV 3
                <Knob min={0} max={1} step={0.01} value={cv3Gain} width={30} height={30} onChange={value => handleCv3GainChange(value)} />
                Res
                <Knob min={0} max={1} step={0.01} value={q} width={30} height={30} onChange={value => handleQChange(value)} />
            </div>
        </div>
    </div>;
};

VCFLowPass.isBrowserSupported = typeof BiquadFilterNode !== 'undefined';
VCFLowPass.panelWidth = 6;

export default VCFLowPass;