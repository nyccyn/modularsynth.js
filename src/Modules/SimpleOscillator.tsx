import * as React from 'react';
import { ModuleProps } from './moduleBase';

interface SimpleOscillatorState {
    type: OscillatorType;
    frequency: number;
}

class SimpleOscillator extends React.Component<ModuleProps, SimpleOscillatorState> {    
    private _oscillator: OscillatorNode;    

    constructor(props: ModuleProps) {
        super(props);
        this._oscillator = props.audioContext.createOscillator();
        this.state = {
            type: this._oscillator.type,
            frequency: this._oscillator.frequency.value
        }
    }

    componentWillMount() {        
        this._oscillator.start();
    }    

    render() {
        return <div>Oscillator</div>;
    }
}

export default SimpleOscillator;