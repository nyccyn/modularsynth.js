import React, { useState, useEffect, useCallback } from 'react';
import { compose, setStatic } from 'recompose';
import { connect } from 'react-redux';
import { connectModules, registerInputs, registerOutputs } from '../actions';
import Port from '../../Common/Port';
import Knob from '../../Common/Knob';
import { useModule } from '../lib';

const QUAL_MUL = 30;

const VCF = ({ id, audioContext, registerInputs, registerOutputs, connections }) => {
    const [type, setType] =  useState('lowpass');
    const [frequency, setFrequency] =  useState(0.5);
    const [q, setQ] =  useState(0.1);
    
    const moduleFactory = useCallback(() => {
        const vcf = audioContext.createBiquadFilter();  
        vcf.type = "lowpass";
        vcf.Q.value = 0.5;
        return { vcf };
    }, [audioContext]);
    const module = useModule(id, moduleFactory);

    useEffect(() => {
        if (!module) return;

        registerInputs(id, {
            In: {
                connect: audioNode => audioNode.connect(module.vcf),
                disconnect: audioNode => audioNode.disconnect(module.vcf)
            },
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

    useEffect(() => {
        if (!module) return;
        module.vcf.Q.value = q * QUAL_MUL;
    }, [module, q])

    const handleFrequencyChange = useCallback((value) => {
        setFrequency(Number(value));
    }, []);

    const handleQChange = useCallback((value) => {
        setQ(Number(value));
    }, []);

    const handleTypeChange = useCallback(({ target: { value }}) => {
        setType(value);
        module.vcf.type = value;
    }, [module]);

    return <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>VCF</span>
            Shape:
            <select value={type} onChange={handleTypeChange}>
                <option value='lowpass'>Low Pass</option>
                <option value='highpass'>High Pass</option>
            </select>
            Frequency:
            <Knob min={0} max={1} step={0.01} value={frequency} onChange={value => handleFrequencyChange(value)}/>
            Q:
            <Knob min={0} max={1} step={0.01} value={q} onChange={value => handleQChange(value)}/>
            <Port portId='In' connections={connections} moduleId={id} portType='input'/>
            <Port portId='Out' connections={connections} moduleId={id} portType='output'/>
        </div>;
};

const mapStateToProps = ({ modules }, ownProps) => ({
    connections: modules.connections[ownProps.id]
});

export default compose(
    setStatic('isBrowserSupported', typeof BiquadFilterNode !== 'undefined'),
    setStatic('panelWidth', 6),
    connect(mapStateToProps, { connectModules, registerInputs, registerOutputs })
)(VCF);