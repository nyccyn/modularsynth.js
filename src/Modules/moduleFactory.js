import SimpleOscillator from './SimpleOscillator';
import StereoAudioInterface from './StereoAudioInterface';
import MonoAudioInterface from './MonoAudioInterface';
import * as R from 'ramda';

export const MODULE_TYPE = {
    OSCILLATOR: 'OSCILLATOR',
    STEREO_AUDIO_INTERFACE: 'STEREO_AUDIO_INTERFACE',
    MONO_AUDIO_INTERFACE: 'MONO_AUDIO_INTERFACE'
};

const moduleCounters = R.map(R.always(1))(MODULE_TYPE);

export const createModule = type => {
    const module = { id: `${type}${moduleCounters[type]}` };
    console.log(moduleCounters);
    console.log(module);
    switch (type){
        case MODULE_TYPE.OSCILLATOR:
            module.Module = SimpleOscillator;
            break;
        case MODULE_TYPE.STEREO_AUDIO_INTERFACE:
            module.Module = StereoAudioInterface;
            break;
        case MODULE_TYPE.MONO_AUDIO_INTERFACE:
            module.Module = MonoAudioInterface;
            break;
        default:
            throw new Error(`Cannot create module of type: ${type}`)
    }
    if (!module.Module.isBrowserSupported) return null;

    moduleCounters[type]++;
    return module;
};