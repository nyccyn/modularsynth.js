import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, withState } from 'recompose';
import ModulePicker from '../../Modules/Components/ModulePicker';
import CablesContainer from '../../Cables/Components/CablesContainer';
import PresetManager from './PresetManager';
import { unsetStartingPort, moveModule } from '../../Modules/actions';
import { modifyCable, removeCable } from '../../Cables/actions';
import './Rack.css';
import Panel from "../../Common/Panel";
import createPulseOscillator from '../helpers/createPulseOscillator';
import createVoltToHzConverter from '../helpers/createVoltToHzConverter';

class Synth extends Component {
    constructor(props) {
        super(props);        

        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleDragging = this.handleDragging.bind(this);
        this.handleRackScroll = this.handleRackScroll.bind(this);

        window.onscroll = e => props.setScrollTop(window.scrollY);

        //temp
        // this._analyser = this._audioContext.createAnalyser();
        // window.analyser = this._analyser;
        // window.visuallize = this.visuallize = this.visuallize.bind(this);
    }

    componentDidUpdate(prevProps)
    {        
        if (!prevProps.audioContextInitiliazed && this.props.audioContextInitiliazed)
        {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            window.audioContext = audioContext;
            audioContext.createPulseOscillator = createPulseOscillator;
            audioContext.createVoltToHzConverter = createVoltToHzConverter;
            this.props.setAudioContext(audioContext);
        }
    }

    visuallize() {
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

        function draw() {
            setTimeout(() => window.v = requestAnimationFrame(draw), 300);

            analyser.getFloatTimeDomainData(dataArray);

            canvasCtx.fillStyle = 'rgb(200, 200, 200)';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

            canvasCtx.beginPath();

            let x = 0;

            for (let i = 0; i < dataArray.length; i++) {

                x = i;
                const y = (0.5 + dataArray[i] / 2) * HEIGHT;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                }
                else {
                    canvasCtx.lineTo(x, y);
                }
            }

            canvasCtx.stroke();
        }

        draw();
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
        const { modifyCable, startingPort, scrollTop } = this.props;
        if (!startingPort) return;
        modifyCable({
            portId: `${startingPort.moduleId}-${startingPort.portId}`,
            toPoint: { x: e.clientX, y: e.clientY + scrollTop }
        });
    }

    dragModule(e) {
        const { draggingModuleId, moveModule, activeRackId } = this.props;
        if (!draggingModuleId) return;
        moveModule(draggingModuleId, e.clientX, activeRackId);
    }

    handleDragging(moduleId) {
        return isDragging => {
            this.props.setDraggingModuleId(isDragging ? moduleId : null);
        }
    }

    handleRackScroll(e) {        
        this.props.setScrollLeft(e.target.scrollLeft);
    }

    render() {
        const { racks, modules, draggingModuleId, scrollLeft, scrollTop, setActiveRackId, audioContext } = this.props;
        return <div onMouseUp={this.handleMouseUp} onMouseMove={this.handleMouseMove} onScroll={this.handleRackScroll}>
            <ModulePicker />
            <PresetManager />
            <div>
                <div style={{ overflowX: 'scroll' }}>
                    {
                        racks.map((moduleIds, rackId) =>
                            <div key={rackId} className='rack' style={{ width: `calc(100% + ${scrollLeft}px)` }} onMouseEnter={() => setActiveRackId(rackId)}>
                                {
                                    audioContext && moduleIds.map(id => {
                                        const { Module, width, left } = modules[id];
                                        return <Panel key={id}
                                            rackId={rackId}
                                            moduleId={id}
                                            setDragging={this.handleDragging(id)}
                                            dragging={id === draggingModuleId}
                                            width={width} left={left}>
                                            <Module id={id} audioContext={audioContext} />
                                        </Panel>;
                                    })
                                }
                            </div>
                        )
                    }
                </div>
                <CablesContainer scrollLeft={scrollLeft} scrollTop={scrollTop} height={racks.length * 1.5 * 370}/>
            </div>
            <canvas ref={ref => this._canvas = ref} className="visualizer" width="640" height="100" />
        </div>;
    }
}

const mapStateToProps = ({ modules }) => ({
    modules: modules.modules,
    racks: modules.racks,
    startingPort: modules.startingPort,
    audioContextInitiliazed: modules.audioContextInitiliazed
});
export default compose(
    withState('draggingModuleId', 'setDraggingModuleId', null),
    withState('scrollLeft', 'setScrollLeft', 0),
    withState('scrollTop', 'setScrollTop', 0),
    withState('activeRackId', 'setActiveRackId', 0),
    withState('audioContext', 'setAudioContext', null),
    connect(mapStateToProps, { modifyCable, removeCable, unsetStartingPort, moveModule })
)(Synth);
