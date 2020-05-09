import React, { useEffect } from 'react';
import * as actions from '../actions';
import Port from 'Common/Port';
import styles from './styles';
import { useConnections } from '../lib';
import { useAction } from 'storeHelpers';

const MonoAudioInterface = ({ id, audioContext }) => {
    const connections = useConnections(id);
    const registerInputs = useAction(actions.registerInputs);    

    useEffect(() => {
        registerInputs(id, {
            In: {
                connect: audioNode => audioNode.connect(audioContext.destination),
                disconnect: audioNode => audioNode.disconnect(audioContext.destination)
            }
        })
    }, [id, registerInputs, audioContext]);

    return <div style={styles.container}>
            <span>Mono</span>
            <div style={styles.body}>
                <Port portId='In' connections={connections} moduleId={id} portType='input'/>
            </div>
        </div>;
};

MonoAudioInterface.isBrowserSupported = true;
MonoAudioInterface.panelWidth = 4;

export default MonoAudioInterface;