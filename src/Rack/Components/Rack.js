import React, { Component } from 'react';
import { connect } from "react-redux";
import * as R from 'ramda';
import ModulePicker from '../../Modules/Components/ModulePicker';
import CablesContainer from '../../Cables/Components/CablesContainer';
import PresetManager from './PresetManager';
import { unsetStartingPort } from '../../Modules/actions';
import { modifyCable, removeCable } from '../../Cables/actions';
import './Rack.css';

class Rack extends Component {
    constructor(props){
        super(props);
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this._audioContext = new AudioContext();
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
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
            <PresetManager/>
            <div>
                <div className='rack'>
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
export default connect(mapStateToProps, { modifyCable, removeCable, unsetStartingPort } )(Rack);
