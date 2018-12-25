import * as R from 'ramda';
import SimpleOscillator from './Components/SimpleOscillator';
import StereoAudioInterface from './Components/StereoAudioInterface';
import MonoAudioInterface from './Components/MonoAudioInterface';
import Keyboard from './Components/Keyboard';
import ADSR from './Components/ADSR';
import Amp from './Components/Amp';

export const MODULE_TYPE = {
    OSCILLATOR: 'OSCILLATOR',
    STEREO_AUDIO_INTERFACE: 'STEREO_AUDIO_INTERFACE',
    MONO_AUDIO_INTERFACE: 'MONO_AUDIO_INTERFACE',
    KEYBOARD: 'KEYBOARD',
    ADSR: 'ADSR',
    AMP: 'AMP'
};

const moduleCounters = R.map(R.always(1))(MODULE_TYPE);

const ONE_HP_IN_PIXELS = 20;

export const createModule = ({ type, id = undefined }) => {
    const module = { id: id || `${type}${moduleCounters[type]}` };
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
        case MODULE_TYPE.KEYBOARD:
            module.Module = Keyboard;
            break;
        case MODULE_TYPE.ADSR:
            module.Module = ADSR;
            break;
        case MODULE_TYPE.AMP:
            module.Module = Amp;
            break;
        default:
            throw new Error(`Cannot create module of type: ${type}`)
    }
    if (!module.Module.isBrowserSupported) return null;

    module.width = module.Module.panelWidth * ONE_HP_IN_PIXELS;
    moduleCounters[type]++;
    return module;
};