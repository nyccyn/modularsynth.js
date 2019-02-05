import React, { Component } from 'react';
import { compose, setStatic, withState } from 'recompose';
import { connect } from 'react-redux';
import { connectModules, registerInputs, registerOutputs } from '../actions';
import Port from '../../Common/Port';
import Knob from '../../Common/Knob';

const QUAL_MUL = 30;

class VCF extends Component {
    constructor(props) {
        super(props);
        if (!props.audioContext) throw new Error("audioContext property must be provided");

        this._vcf = props.audioContext.createBiquadFilter();  
        this._vcf.type = "lowpass";
        this._vcf.Q.value = 0.5;
        this.handleFrequencyChange = this.handleFrequencyChange.bind(this);
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.setPitch = this.setPitch.bind(this);
        this.handleQChange = this.handleQChange.bind(this);
        this.setQuality = this.setQuality.bind(this);       
    }

    componentWillMount() {
        const { id, registerInputs, registerOutputs } = this.props;        
        registerInputs(id, {
            In: {
                connect: audioNode => audioNode.connect(this._vcf),
                disconnect: audioNode => audioNode.disconnect(this._vcf)
            },
        });
        registerOutputs(id, {
           Out: this._vcf
        });
    }

    handleFrequencyChange(value) {
        this.props.setFrequency(Number(value), this.setPitch);
    }

    setPitch()
    {
        const { frequency, audioContext } = this.props;
        // Clamp the frequency between the minimum value (40 Hz) and half of the
        // sampling rate.
        const minValue = 40;
        const maxValue = audioContext.sampleRate / 2;
        // Logarithm (base 2) to compute how many octaves fall in the range.
        const numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
        // Compute a multiplier from 0 to 1 based on an exponential scale.
        const multiplier = Math.pow(2, numberOfOctaves * (frequency - 1.0));
        // Get back to the frequency value between min and max.
        this._vcf.frequency.setValueAtTime(maxValue * multiplier, audioContext.currentTime);
    }

    handleQChange(value) {
        this.props.setQ(Number(value), this.setQuality);
    }

    handleTypeChange({ target: { value }}) {
        this.props.setType(value);
        this._vcf.type = value;
    }

    setQuality()
    {
        const { q } = this.props;
        this._vcf.Q.value = q * QUAL_MUL;
    }

    render() {
        const { id, connections, type, frequency, q } = this.props;        
        return <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>VCF</span>
            Shape:
            <select value={type} onChange={this.handleTypeChange}>
                <option value='lowpass'>Low Pass</option>
                <option value='highpass'>High Pass</option>
            </select>
            Frequency:
            <Knob min={0} max={1} step={0.01} value={frequency} onChange={value => this.handleFrequencyChange(value)}/>
            Q:
            <Knob min={0} max={1} step={0.01} value={q} onChange={value => this.handleQChange(value)}/>
            <Port portId='In' connections={connections} moduleId={id} portType='input'/>
            <Port portId='Out' connections={connections} moduleId={id} portType='output'/>
        </div>;
    }
}

const mapStateToProps = ({ modules }, ownProps) => ({
    connections: modules.connections[ownProps.id]
});

export default compose(
    setStatic('isBrowserSupported', typeof BiquadFilterNode !== 'undefined'),
    setStatic('panelWidth', 6),
    withState('type', 'setType', 'lowpass'),
    withState('frequency', 'setFrequency', 0.1),
    withState('q', 'setQ', 0.5),
    connect(mapStateToProps, { connectModules, registerInputs, registerOutputs })
)(VCF);