import React, { Component } from 'react';
import { compose, setStatic } from 'recompose';
import { connect } from 'react-redux';
import { connectModules, registerInputs } from '../actions';
import Port from '../../Common/Port';

class StereoAudioInterface extends Component {
    constructor(props){
        super(props);
        if (!props.audioContext) throw new Error('audioContext property must be provided');

        this._leftPanner = new StereoPannerNode(props.audioContext, { pan: -1 });
        this._rightPanner = new StereoPannerNode(props.audioContext, { pan: 1 });
        this._leftPanner.connect(props.audioContext.destination);
        this._rightPanner.connect(props.audioContext.destination);
    }

    componentWillMount() {
        const { id, registerInputs } = this.props;
        registerInputs(id, {
            Left: {
                connect: audioNode => audioNode.connect(this._leftPanner),
                disconnect: audioNode => audioNode.disconnect(this._leftPanner)
            },
            Right: {
                connect: audioNode => audioNode.connect(this._rightPanner),
                disconnect: audioNode => audioNode.disconnect(this._rightPanner)
            }
        })
    }

    render(){
        const { id, connections } = this.props;
        return <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>Stereo</span>
            <Port portId='Left' connections={connections} moduleId={id} portType='input'/>
            <Port portId='Right' connections={connections} moduleId={id} portType='input'/>
        </div>;
    }
}

const mapStateToProps = ({ modules }, ownProps) => ({
    connections: modules.connections[ownProps.id]
});

export default compose(
    setStatic('isBrowserSupported', typeof StereoPannerNode !== 'undefined'),
    setStatic('panelWidth', 4),
    connect(mapStateToProps, { connectModules, registerInputs })
)(StereoAudioInterface);