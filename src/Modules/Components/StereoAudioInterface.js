import React, { useEffect, useMemo } from 'react';
import Port from 'Common/Port';
import styles from './styles';
import * as actions from '../actions';
import { useConnections } from '../lib';
import { useAction } from 'storeHelpers';

const StereoAudioInterface = ({ id, audioContext, viewMode }) => {
    const connections = useConnections(id);
    const registerInputs = useAction(actions.registerInputs);    

    const module = useMemo(() => {
        if (viewMode) return null;

        const leftPanner = new StereoPannerNode(audioContext, { pan: -1 });
        const rightPanner = new StereoPannerNode(audioContext, { pan: 1 });
        leftPanner.connect(audioContext.destination);
        rightPanner.connect(audioContext.destination);
        return { leftPanner, rightPanner };
    }, [audioContext, viewMode])

    useEffect(() => {
        if (!module) return;

        registerInputs(id, {
            Left: {
                connect: audioNode => audioNode.connect(module.leftPanner),
                disconnect: audioNode => audioNode.disconnect(module.leftPanner)
            },
            Right: {
                connect: audioNode => audioNode.connect(module.rightPanner),
                disconnect: audioNode => audioNode.disconnect(module.rightPanner)
            }
        });
    }, [module, id, registerInputs]);

    return <div style={styles.container}>
            <span>Stereo</span>
            <div style={styles.body}>
                <Port portId='Left' connections={connections} moduleId={id} portType='input'/>
                <Port portId='Right' connections={connections} moduleId={id} portType='input'/>
            </div>
        </div>;
};

StereoAudioInterface.isBrowserSupported = typeof StereoPannerNode !== 'undefined';
StereoAudioInterface.panelWidth = 4;
StereoAudioInterface.title = `
Stereo Audio Interface<br/>
Sends stereo audio to the computer's audio interface
`;

export default StereoAudioInterface;