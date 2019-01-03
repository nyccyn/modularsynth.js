import React, { Component } from 'react';
import { compose, setStatic } from 'recompose';
import { connect } from 'react-redux';
import { connectModules, registerInputs, registerOutputs } from '../actions';
import Port from '../../Common/Port';

class Amp extends Component {
    constructor(props) {
        super(props);
        if (!props.audioContext) throw new Error("audioContext property must be provided");
        this._gain = props.audioContext.createGain();            
    }

    componentWillMount() {
        const { id, registerInputs, registerOutputs } = this.props;
        registerInputs(id, {
            In: {
                connect: audioNode => audioNode.connect(this._gain),
                disconnect: audioNode => audioNode.disconnect(this._gain)
            },
            CV: {
                connect: audioNode => {
                    this._gain.gain.value = 0;
                    audioNode.connect(this._gain.gain);
                },
                disconnect: audioNode => {
                    this._gain.gain.value = 1;
                    audioNode.disconnect(this._gain.gain);
                }
            }
        });
        registerOutputs(id, {
           Out: this._gain
        });
    }

    render() {
        const { id, connections } = this.props;
        return <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>VCA</span>
            <Port portId='In' connections={connections} moduleId={id} portType='input'/>
            <Port portId='CV' connections={connections} moduleId={id} portType='input'/>
            <Port portId='Out' connections={connections} moduleId={id} portType='output'/>
        </div>;
    }
}

const mapStateToProps = ({ modules }, ownProps) => ({
    connections: modules.connections[ownProps.id]    
});

export default compose(
    setStatic('isBrowserSupported', typeof GainNode !== 'undefined'),
    setStatic('panelWidth', 4),
    connect(mapStateToProps, { connectModules, registerInputs, registerOutputs })
    )(Amp);