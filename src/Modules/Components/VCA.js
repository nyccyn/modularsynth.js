import React, { useEffect, useCallback } from 'react';
import { compose, setStatic } from 'recompose';
import { connect } from 'react-redux';
import { connectModules, registerInputs, registerOutputs } from '../actions';
import Port from '../../Common/Port';
import styles from './styles';
import { useModule } from '../lib';

const VCA = ({ id, registerInputs, registerOutputs, audioContext, connections }) => {    
    const moduleFactory = useCallback(() => ({ gain: audioContext.createGain() }), [audioContext]);
    const module = useModule(id, moduleFactory);

    useEffect(() => {
        if (!module) return;

        registerInputs(id, {
            In: {
                connect: audioNode => audioNode.connect(module.gain),            
                disconnect: audioNode => audioNode.disconnect(module.gain)
            },
            CV: {
                connect: audioNode => {
                    module.gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.01);
                    return audioNode.connect(module.gain.gain);
                },
                disconnect: audioNode => {                
                    module.gain.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
                    audioNode.disconnect(module.gain.gain);

                    // Workaround:
                    // If the connected audio node is being disconnected before finishing its changes (etc. linearRampToValueAtTime in release phase) it won't effect any more
                    if (audioNode.offset) {
                        audioNode.offset.value = 0;
                    }
                }
            }
        });
        registerOutputs(id, {
            Out: module.gain
        });
    }, [module, id, registerInputs, registerOutputs, audioContext]);

    return <div style={styles.container}>
        <span>VCA</span>
        <div style={styles.body}>
            <Port portId='In' connections={connections} moduleId={id} portType='input' />
            <Port portId='CV' connections={connections} moduleId={id} portType='input' />
            <Port portId='Out' connections={connections} moduleId={id} portType='output' />
        </div>
    </div>;
};

const mapStateToProps = ({ modules }, ownProps) => ({
    connections: modules.connections[ownProps.id]
});

export default compose(
    setStatic('isBrowserSupported', typeof GainNode !== 'undefined'),
    setStatic('panelWidth', 4),
    connect(mapStateToProps, { connectModules, registerInputs, registerOutputs })
)(VCA);