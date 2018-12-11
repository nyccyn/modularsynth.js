import React, { Component } from 'react';
import { compose, setStatic, withState } from 'recompose';
import { connect } from 'react-redux';
import { connectModules, registerInputs, registerOutputs } from '../actions';
import Port from './Port';

class ADSR extends Component {
    constructor(props) {
        super(props);    
        this.handleGateInChange = this.handleGateInChange.bind(this);    
        this._portOut = {
            onChange: null
        }
    }

    componentWillMount() {
        const { id, registerInputs, registerOutputs } = this.props;        
        registerInputs(id, {
            Gate: {
                connect: port => {                
                    port.onChange = this.handleGateInChange;
                    this.handleGateInChange(port.value);
                },
                disconnect: port => {
                    port.onChange = null;                
                }
            }
        });
        registerOutputs(id, {
           Out: this._portOut
        });
    }

    handleGateInChange(value) {
        if (!this._portOut.onChange) return;
        const { attack, decay, sustain, release } = this.props;
        if (value === 1) {            
            this._portOut.onChange({ value: 1, time: attack });
            this._portOut.onChange({ value: sustain, time: attack + decay });
        } else if (value === 0) {            
            this._portOut.onChange({ value: 0, time: release, forceChange: true });
        }
    }

    render() {
        const { id, connections, attack, setAttack, decay, setDecay,
            sustain, setSustain, release, setRelease } = this.props;        
        return <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>{id}</span>
            Attack:
            <input type='range' min={0.01} max={15} step={0.01} value={attack} onChange={({ target: { value }}) => setAttack(Number(value))}/>
            Decay:
            <input type='range' min={0.01} max={15} step={0.01} value={decay} onChange={({ target: { value }}) => setDecay(Number(value))}/>
            Sustain:
            <input type='range' min={0} max={1} step={0.01} value={sustain} onChange={({ target: { value }}) => setSustain(Number(value))}/>
            Release:
            <input type='range' min={0.01} max={15} step={0.01} value={release} onChange={({ target: { value }}) => setRelease(Number(value))}/>
            Gate:
            <Port portId='Gate' connections={connections} moduleId={id} portType='input'/>
            Out:
            <Port portId='Out' connections={connections} moduleId={id} portType='output'/>
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => ({
    connections: state.connections[ownProps.id]
});

export default compose(
    setStatic('isBrowserSupported', true),
    withState('attack', 'setAttack', 0.01),
    withState('decay', 'setDecay', 0.6),
    withState('sustain', 'setSustain', 0.5),
    withState('release', 'setRelease', 0.5),
    connect(mapStateToProps, { connectModules, registerInputs, registerOutputs })
)(ADSR);