import React, { useEffect } from 'react';
import { compose, setStatic } from 'recompose';
import { connect } from 'react-redux';
import { connectModules, registerInputs } from '../actions';
import Port from '../../Common/Port';
import styles from './styles';

const MonoAudioInterface = ({ id, audioContext, registerInputs, connections }) => {
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

const mapStateToProps = ({ modules }, ownProps) => ({
    connections: modules.connections[ownProps.id]
});

export default compose(
    setStatic('isBrowserSupported', true),
    setStatic('panelWidth', 4),
    connect(mapStateToProps, { connectModules, registerInputs })
)(MonoAudioInterface);