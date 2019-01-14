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
import createPulseOscillator from '../helpers/createPulseOscillator';
import createVoltToHzConverter from '../helpers/createVoltToHzConverter';

class Rack extends Component {
    constructor(props){
        super(props);
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this._audioContext = new AudioContext();
        this._audioContext.createPulseOscillator = createPulseOscillator;
        this._audioContext.createVoltToHzConverter = createVoltToHzConverter;

        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleDragging = this.handleDragging.bind(this);

        //temp
        this._analyser = this._audioContext.createAnalyser();
        window.analyser = this._analyser;
        window.visuallize = this.visuallize = this.visuallize.bind(this);
    }

    visuallize()
    {
        const canvas = this._canvas;
        const canvasCtx = canvas.getContext("2d");
        const analyser = this._analyser;

        analyser.fftSize = 1024;
        const dataArray = new Float32Array(analyser.frequencyBinCount);
        canvas.width = dataArray.length;
        canvas.height = 200;
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;

        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

        function draw()
        {
            setTimeout(() => window.v = requestAnimationFrame(draw), 300);

            analyser.getFloatTimeDomainData(dataArray);

            canvasCtx.fillStyle = 'rgb(200, 200, 200)';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

            canvasCtx.beginPath();

            let x = 0;

            for (let i = 0; i < dataArray.length; i++)
            {

                x = i;
                const y = (0.5 + dataArray[i] / 2) * HEIGHT;

                if (i === 0)
                {
                    canvasCtx.moveTo(x, y);
                }
                else
                {
                    canvasCtx.lineTo(x, y);
                }
            }

            canvasCtx.stroke();
        }

        draw();
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
            <canvas ref={ref => this._canvas = ref} className="visualizer" width="640" height="100"/>
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
