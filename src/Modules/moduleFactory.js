import SimpleOscillator from './SimpleOscillator';
import AudioInterface from './AudioInterface';
import * as R from 'ramda';

export const MODULE_TYPE = {
    OSCILLATOR: 'OSCILLATOR',
    AUDIO_INTERFACE: 'AUDIO_INTERFACE'
};

const moduleCounters = R.map(R.always(0))(MODULE_TYPE);

export const createModule = type => {
    const module = { id: `${type}${moduleCounters[type]}` };
    switch (type){
        case MODULE_TYPE.OSCILLATOR:
            module.Module = SimpleOscillator;
            break;
        case MODULE_TYPE.AUDIO_INTERFACE:
            module.Module = AudioInterface;
            break;
        default:
            throw new Error(`Cannot create module of type: ${type}`)
    }
    moduleCounters[type]++;
    return module;
};