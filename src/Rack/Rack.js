import React, { Component } from 'react';
import { connect } from "react-redux";
import * as R from 'ramda';
import ModulePicker from '../Modules/Components/ModulePicker';
import CablesContainer from '../Cables/Components/CablesContainer';

import * as actions from '../Modules/actions';
import { modifyCable, removeCable } from '../Cables/actions';
import { MODULE_TYPE } from '../Modules/moduleFactory';

class Rack extends Component {
    constructor(props){
        super(props);
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this._audioContext = new AudioContext();
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    handleCreate() {
        this.props.addModule(MODULE_TYPE.KEYBOARD);
        this.props.addModule(MODULE_TYPE.OSCILLATOR);
        this.props.addModule(MODULE_TYPE.ADSR);
        this.props.addModule(MODULE_TYPE.AMP);
        this.props.addModule(MODULE_TYPE.MONO_AUDIO_INTERFACE);
    }

    handleConnect() {
        this.props.connectModules({
            input: { moduleId: 'OSCILLATOR1', portId: 'V/Oct' },
            output: { moduleId: 'KEYBOARD1', portId: 'CV' }
        });
        this.props.connectModules({
            input: { moduleId: 'ADSR1', portId: 'Gate' },
            output: { moduleId: 'KEYBOARD1', portId: 'Gate' }
        });
        this.props.connectModules({
            input: { moduleId: 'AMP1', portId: 'In' },
            output: { moduleId: 'OSCILLATOR1', portId: 'Out' }
        });
        this.props.connectModules({
            input: { moduleId: 'AMP1', portId: 'CV' },
            output: { moduleId: 'ADSR1', portId: 'Out' }
        });
        this.props.connectModules({
            input: { moduleId: 'MONO_AUDIO_INTERFACE1', portId: 'In' },
            output: { moduleId: 'AMP1', portId: 'Out' }
        });
    }

    handleMouseUp() {
        const { unsetStartingPort, removeCable, startingPort } = this.props;
        if (!startingPort) return;
        removeCable(`${startingPort.moduleId}-${startingPort.portId}`);
        unsetStartingPort();
    }

    handleMouseMove(e) {
        const { modifyCable, startingPort } = this.props;
        if (!startingPort) return;
        modifyCable({
            portId: `${startingPort.moduleId}-${startingPort.portId}`,
            toPoint: { x: e.clientX, y: e.clientY }
        });
    }

    render() {
        const { modules } = this.props;
        return <div onMouseUp={this.handleMouseUp} onMouseMove={this.handleMouseMove}>
            <ModulePicker/>
            <button onClick={() => this.handleCreate()}>Create sample</button>
            <button onClick={() => this.handleConnect()}>Connect sample</button>
            <div>
                <div style={{ display: 'flex', userSelect: 'none' }}>
                    { modules.map(({ Module, id }) => <Module id={id} key={id} audioContext={this._audioContext}/>) }
                </div>
                <CablesContainer/>
            </div>
        </div>;
    }
}

const mapStateToProps = state => ({
    modules: R.values(state.modules.modules),
    startingPort: state.modules.startingPort
});
export default connect(mapStateToProps, {...actions, modifyCable, removeCable } )(Rack);
