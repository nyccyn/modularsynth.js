import React, { Component } from 'react';
import { compose, setStatic } from 'recompose';
import { connect } from 'react-redux';
import { connectModules, registerInputs } from '../actions';
import Port from '../Common/Port';
import Panel from '../Common/Panel';

class StereoAudioInterface extends Component {
    constructor(props){
        super(props);
        if (!props.audioContext) throw new Error('audioContext property must be provided');
    }

    componentWillMount() {
        const { id, registerInputs } = this.props;
        registerInputs(id, {
            In: {
                connect: audioNode => audioNode.connect(this.props.audioContext.destination),
                disconnect: audioNode => audioNode.disconnect(this.props.audioContext.destination)
            }
        })
    }

    render(){
        const { id, connections } = this.props;
        return <Panel header={<span>Mono<br/>Interface</span>}>
            <Port portId='In' connections={connections} moduleId={id} portType='input'/>
        </Panel>;
    }
}

const mapStateToProps = ({ modules }, ownProps) => ({
    connections: modules.connections[ownProps.id]
});

export default compose(
    setStatic('isBrowserSupported', true),
    connect(mapStateToProps, { connectModules, registerInputs })
)(StereoAudioInterface);