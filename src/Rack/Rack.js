import React, { Component } from 'react';
import { connect } from "react-redux";
import * as R from 'ramda';
import ModulePicker from '../Modules/Components/ModulePicker';

import * as actions from '../Modules/actions';
import { MODULE_TYPE } from '../Modules/moduleFactory';

class Rack extends Component {
    constructor(props){
        super(props);
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this._audioContext = new AudioContext();
        this.handleMouseUp = this.handleMouseUp.bind(this);
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

    handleMouseUp(){
        this.props.unsetStartingPort();
    }

    render() {
        const { modules } = this.props;
        return <div onMouseUp={this.handleMouseUp}>
            <ModulePicker/>
            <button onClick={() => this.handleCreate()}>Create sample</button>
            <button onClick={() => this.handleConnect()}>Connect sample</button>
            <div style={{ display: "flex" }}>
                { modules.map(({ Module, id }) => <Module id={id} key={id} audioContext={this._audioContext}/>) }
            </div>
        </div>;
    }
}

const mapStateToProps = state => ({
    modules: R.values(state.modules.modules)
});
export default connect(mapStateToProps, {...actions})(Rack);
