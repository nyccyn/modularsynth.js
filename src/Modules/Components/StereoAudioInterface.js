import React, { useEffect, useCallback } from 'react';
import { compose, setStatic } from 'recompose';
import { connect } from 'react-redux';
import { connectModules, registerInputs } from '../actions';
import Port from '../../Common/Port';
import styles from './styles';
import { useModule } from "../lib";

const StereoAudioInterface = ({ id, audioContext, registerInputs, connections }) => {
    const moduleFactory = useCallback(() => {
        const leftPanner = new StereoPannerNode(audioContext, { pan: -1 });
        const rightPanner = new StereoPannerNode(audioContext, { pan: 1 });
        leftPanner.connect(audioContext.destination);
        rightPanner.connect(audioContext.destination);
        return { leftPanner, rightPanner };
    }, [audioContext])

    const module = useModule(id, moduleFactory);

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

const mapStateToProps = ({ modules }, ownProps) => ({
    connections: modules.connections[ownProps.id]
});

export default compose(
    setStatic('isBrowserSupported', typeof StereoPannerNode !== 'undefined'),
    setStatic('panelWidth', 4),
    connect(mapStateToProps, { connectModules, registerInputs })
)(StereoAudioInterface);