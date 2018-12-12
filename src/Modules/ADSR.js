import React, { Component } from 'react';
import { compose, setStatic, withState } from 'recompose';
import { connect } from 'react-redux';
import { connectModules, registerInputs, registerOutputs } from '../actions';
import Port from './Port';

class ADSR extends Component {
    constructor(props) {
        super(props);
        if (!props.audioContext) throw new Error("audioContext property must be provided");

        this._adsr = props.audioContext.createConstantSource();        
        this._adsr.offset.value = -1;
        this._adsr.start();
        this.handleGateInChange = this.handleGateInChange.bind(this);        
    }

    componentWillMount() {
        const { id, registerInputs, registerOutputs } = this.props;        
        registerInputs(id, {
            Gate: {
                connect: audioNode => {
                    this._gateInterval = null;
                    for (let p in audioNode) {
                        if (audioNode[p] instanceof AudioParam) {
                            this._lastValue = audioNode[p].value;
                            this._gateInterval = setInterval(() => {
                                if (this._lastValue !== audioNode[p].value) {
                                    this._lastValue = audioNode[p].value;
                                    this.handleGateInChange(this._lastValue);
                                }
                            }, 0);
                            break;
                        }
                    }
                },
                disconnect: () => {
                    if (this._gateInterval) {
                        clearInterval((this._gateInterval));
                    }
                }
            }
        });
        registerOutputs(id, {
           Out: this._adsr
        });
    }

    handleGateInChange(value) {    
        const { attack, decay, sustain, release, audioContext } = this.props;
        const now = audioContext.currentTime;
        const offset = this._adsr.offset;

        if (value === 1) {
            offset.cancelScheduledValues(0);
            offset.linearRampToValueAtTime(-1, now + 0.01);
            offset.linearRampToValueAtTime(0, now + attack);
            offset.linearRampToValueAtTime(sustain - 1, now + attack + decay);
        } else if (value === 0) {
            offset.cancelScheduledValues(0);
            offset.setValueAtTime(offset.value, now);
            offset.linearRampToValueAtTime(-1, now + release);
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
    setStatic('isBrowserSupported', typeof ConstantSourceNode !== 'undefined'),
    withState('attack', 'setAttack', 0.01),
    withState('decay', 'setDecay', 0.6),
    withState('sustain', 'setSustain', 0.5),
    withState('release', 'setRelease', 0.5),
    connect(mapStateToProps, { connectModules, registerInputs, registerOutputs })
)(ADSR);