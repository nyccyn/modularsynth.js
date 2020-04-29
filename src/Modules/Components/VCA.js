import React, { useEffect, useCallback, useMemo } from 'react';
import * as actions from '../actions';
import Port from '../../Common/Port';
import styles from './styles';
import { useConnections } from '../lib';
import { useAction } from '../../storeHelpers';

const VCA = ({ id, audioContext }) => {    
    const connections = useConnections(id);
    const registerInputs = useAction(actions.registerInputs);
    const registerOutputs = useAction(actions.registerOutputs);

    const module = useMemo(() => ({ gain: audioContext.createGain() }), [audioContext]);    

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

VCA.isBrowserSupported = typeof GainNode !== 'undefined';
VCA.panelWidth = 4;

export default VCA;