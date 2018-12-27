import React, { Component } from 'react';
import { compose, setStatic, withState } from 'recompose';
import { connect } from 'react-redux';
import { connectModules, registerInputs, registerOutputs } from '../actions';
import Port from '../../Common/Port';
import { listenToFirstAudioParam } from '../portHelpers';

var QUAL_MUL = 30;

class VCF extends Component {
    constructor(props) {
        super(props);
        if (!props.audioContext) throw new Error("audioContext property must be provided");

        this._vcf = props.audioContext.createBiquadFilter();  
        this._vcf.type = "lowpass";
        this.handleFrequencyChange = this.handleFrequencyChange.bind(this);
        this.setPitch = this.setPitch.bind(this);
        this.handleQChange = this.handleQChange.bind(this);
        this.setQuality = this.setQuality.bind(this);
        //this._vcf.offset.value = -1;
        //this._vcf.start();
        //this.handleGateInChange = this.handleGateInChange.bind(this);        
    }

    componentWillMount() {
        const { id, registerInputs, registerOutputs } = this.props;        
        registerInputs(id, {
            Input: {
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
        var minValue = 40;
        var maxValue = audioContext.sampleRate / 2;
        // Logarithm (base 2) to compute how many octaves fall in the range.
        var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
        // Compute a multiplier from 0 to 1 based on an exponential scale.
        var multiplier = Math.pow(2, numberOfOctaves * (frequency - 1.0));
        // Get back to the frequency value between min and max.
        this._vcf.frequency.value = maxValue * multiplier;
    }

    handleQChange(value) {
        this.props.setQ(Number(value), this.setQuality);
    }

    setQuality()
    {
        const { q } = this.props;
        this._vcf.Q.value = q * QUAL_MUL;
    }

    render() {
        const { id, connections, frequency, q, setQ } = this.props;        
        return <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>VCF</span>
            Frequency:
            <input type='range' min={0} max={1} step={0.01} value={frequency} onChange={({ target: { value }}) => this.handleFrequencyChange(value)}/>
            Q:
            <input type='range' min={0} max={30} step={1} value={q} onChange={({ target: { value }}) => this.handleQChange(value)}/>
            <Port portId='Input' connections={connections} moduleId={id} portType='input'/>
            <Port portId='Out' connections={connections} moduleId={id} portType='output'/>
        </div>;
    }
}

const mapStateToProps = ({ modules }, ownProps) => ({
    connections: modules.connections[ownProps.id]
});

export default compose(
    setStatic('isBrowserSupported', typeof ConstantSourceNode !== 'undefined'),
    setStatic('panelWidth', 6),
    withState('frequency', 'setFrequency', 0.1),
    withState('q', 'setQ', 15),
    connect(mapStateToProps, { connectModules, registerInputs, registerOutputs })
)(VCF);