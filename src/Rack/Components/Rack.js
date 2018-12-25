import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, withState } from 'recompose';
import * as R from 'ramda';
import ModulePicker from '../../Modules/Components/ModulePicker';
import CablesContainer from '../../Cables/Components/CablesContainer';
import PresetManager from './PresetManager';
import { unsetStartingPort, moveModule } from '../../Modules/actions';
import { modifyCable, removeCable, modifyModuleCables } from '../../Cables/actions';
import './Rack.css';
import Panel from "../../Common/Panel";

class Rack extends Component {
    constructor(props){
        super(props);
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this._audioContext = new AudioContext();
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleDragging = this.handleDragging.bind(this);
    }

    componentDidUpdate(prevProps) {
        const { modules, modifyModuleCables } = this.props;
        let prevModule;
        const movedModule = R.find(
            ({ id, left }) => {
                prevModule = R.find(R.where({
                    id: R.equals(id),
                    left: R.complement(R.equals(left))
                }))(prevProps.modules)
                return !R.isNil(prevModule)
            }
        )(modules);
        if (movedModule) {
            modifyModuleCables({
                moduleId: movedModule.id,
                diff: movedModule.left - prevModule.left
            })
        }
    }

    handleMouseUp() {
        const { unsetStartingPort, removeCable, startingPort } = this.props;
        if (!startingPort) return;
        removeCable(`${startingPort.moduleId}-${startingPort.portId}`);
        unsetStartingPort();
    }

    handleMouseMove(e) {
        this.moveCable(e);
        this.dragModule(e);
    }

    moveCable(e) {
        const { modifyCable, startingPort } = this.props;
        if (!startingPort) return;
        modifyCable({
            portId: `${startingPort.moduleId}-${startingPort.portId}`,
            toPoint: { x: e.clientX, y: e.clientY }
        });
    }

    dragModule(e) {
        const { draggingModuleId, moveModule } = this.props;
        if (!draggingModuleId) return;
        moveModule(draggingModuleId, e.clientX);
    }

    handleDragging(moduleId) {
        return isDragging => {
            this.props.setDraggingModuleId(isDragging ? moduleId : null);
        }
    }

    render() {
        const { modules, draggingModuleId } = this.props;
        return <div onMouseUp={this.handleMouseUp} onMouseMove={this.handleMouseMove}>
            <ModulePicker/>
            <PresetManager/>
            <div>
                <div className='rack'>
                    { modules.map(({ Module, id, width, left }) =>
                        <Panel key={id}
                               setDragging={this.handleDragging(id)}
                               dragging={ id === draggingModuleId }
                               width={width} left={left}>
                            <Module id={id} audioContext={this._audioContext}/>
                        </Panel>
                    ) }
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
export default compose(
    withState('draggingModuleId', 'setDraggingModuleId', null),
    connect(mapStateToProps, { modifyCable, removeCable, unsetStartingPort, moveModule, modifyModuleCables })
)(Rack);
