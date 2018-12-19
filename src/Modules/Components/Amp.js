import React, { Component } from 'react';
import { compose, setStatic } from 'recompose';
import { connect } from 'react-redux';
import { connectModules, registerInputs, registerOutputs } from '../actions';
import Port from './Port';

class Amp extends Component {
    constructor(props) {
        super(props);
        if (!props.audioContext) throw new Error("audioContext property must be provided");
        this._gain = props.audioContext.createGain();            
    }

    componentWillMount() {
        const { id, registerInputs, registerOutputs, audioContext } = this.props;        
        registerInputs(id, {
            In: {
                connect: audioNode => audioNode.connect(this._gain),
                disconnect: audioNode => audioNode.disconnect(this._gain)
            },
            CV: {
                connect: audioNode => audioNode.connect(this._gain.gain),
                disconnect: audioNode => audioNode.disconnect(this._gain.gain)
            }
        });
        registerOutputs(id, {
           Out: this._gain
        });
    }

    render() {
        const { id, connections } = this.props;
        return <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>{id}</span>
            In:
            <Port portId='In' connections={connections} moduleId={id} portType='input'/>
            CV:
            <Port portId='CV' connections={connections} moduleId={id} portType='input'/>
            Out:
            <Port portId='Out' connections={connections} moduleId={id} portType='output'/>
        </div>;
    }
}

const mapStateToProps = ({ modules }, ownProps) => ({
    connections: modules.connections[ownProps.id]    
});

export default compose(
    setStatic('isBrowserSupported', typeof GainNode !== 'undefined'),
    connect(mapStateToProps, { connectModules, registerInputs, registerOutputs })
    )(Amp);