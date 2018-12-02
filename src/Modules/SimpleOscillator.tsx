import * as React from 'react';
import { compose, withState } from 'recompose';
import { ModuleProps } from './moduleBase';

interface OscillatorTypeState {
    type: OscillatorType;
    setType: (type: OscillatorType) => void;
}

interface FrequencyState {
    frequency: number;
    setFrequency: (frequency: number) => void;
}

type SimpleOscillatorProps = ModuleProps & OscillatorTypeState & FrequencyState;

class SimpleOscillator extends React.Component<SimpleOscillatorProps> {    
    private _oscillator: OscillatorNode;    

    constructor(props: SimpleOscillatorProps) {
        super(props);
        this._oscillator = props.audioContext.createOscillator();
    }

    componentWillMount() {
        const { type, frequency, audioContext } = this.props;
        this._oscillator.type = type;
        this._oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        this._oscillator.start();
    }

    componentDidUpdate(prevProps: SimpleOscillatorProps) {
        const { type, frequency, audioContext } = this.props;
        if (type !== prevProps.type) {
            this._oscillator.type = type;
        }

        if (frequency !== prevProps.frequency) {
            this._oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        }
    }

    render() {
        return <div>Oscillator</div>;
    }
}

export default compose<SimpleOscillatorProps, {}>(
    withState<OscillatorTypeState, OscillatorType, 'type', 'setType'>('type', 'setType', 'sine'),
    withState<FrequencyState, number, 'frequency', 'setFrequency'>('frequency', 'setFrequency', 440)
)(SimpleOscillator);
// export default Oscillator;