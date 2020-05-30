import React, { useEffect } from 'react';
import * as actions from '../actions';
import Port from 'Common/Port';
import styles from './styles';
import { useConnections } from '../lib';
import { useAction } from 'storeHelpers';

const MonoAudioInterface = ({ id, audioContext, viewMode }) => {
    const connections = useConnections(id);
    const registerInputs = useAction(actions.registerInputs);    

    useEffect(() => {
        if (viewMode) return;

        registerInputs(id, {
            In: {
                connect: audioNode => audioNode.connect(audioContext.destination),
                disconnect: audioNode => audioNode.disconnect(audioContext.destination)
            }
        })
    }, [id, registerInputs, audioContext, viewMode]);

    return <div style={styles.container}>
            <span>Mono</span>
            <div style={styles.body}>
                <Port portId='In' connections={connections} moduleId={id} portType='input'/>
            </div>
        </div>;
};

MonoAudioInterface.isBrowserSupported = true;
MonoAudioInterface.panelWidth = 4;
MonoAudioInterface.title = `
Mono Audio Interface<br/>
Sends audio to the computer's audio interface
`;

export default MonoAudioInterface;