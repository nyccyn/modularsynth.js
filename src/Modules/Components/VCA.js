import React, { Component } from 'react';
import { compose, setStatic } from 'recompose';
import { connect } from 'react-redux';
import { connectModules, registerInputs, registerOutputs } from '../actions';
import Port from '../../Common/Port';
import styles from './styles';

class VCA extends Component {
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
                connect: audioNode => {
                    this._gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.01);
                    audioNode.connect(this._gain.gain);
                },
                disconnect: audioNode => {
                    this._gain.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
                    audioNode.disconnect(this._gain.gain);

                    // Workaround:
                    // If the connected audio node is being disconnected before finishing its changes (etc. linearRampToValueAtTime in release phase) it won't effect any more
                    if (audioNode.offset)
                    {
                        audioNode.offset.value = 0;
                    }
                }
            }
        });
        registerOutputs(id, {
           Out: this._gain
        });
    }

    render() {
        const { id, connections } = this.props;
        return <div style={styles.container}>
            <span>VCA</span>
            <div style={styles.body}>
                <Port portId='In' connections={connections} moduleId={id} portType='input'/>
                <Port portId='CV' connections={connections} moduleId={id} portType='input'/>
                <Port portId='Out' connections={connections} moduleId={id} portType='output'/>
            </div>
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
    )(VCA);