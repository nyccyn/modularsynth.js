import * as R from 'ramda';
import VCO from './Components/VCO';
import StereoAudioInterface from './Components/StereoAudioInterface';
import MonoAudioInterface from './Components/MonoAudioInterface';
import Keyboard from './Components/Keyboard';
import ADSR from './Components/ADSR';
import VCA from './Components/VCA';

export const MODULE_TYPE = {
    VCO: 'VCO',
    STEREO_AUDIO_INTERFACE: 'STEREO_AUDIO_INTERFACE',
    MONO_AUDIO_INTERFACE: 'MONO_AUDIO_INTERFACE',
    KEYBOARD: 'KEYBOARD',
    ADSR: 'ADSR',
    VCA: 'VCA'
};

const moduleCounters = R.map(R.always(1))(MODULE_TYPE);

const ONE_HP_IN_PIXELS = 20;

export const createModule = ({ type, id = undefined }) => {
    const module = { id: id || `${type}${moduleCounters[type]}` };
    switch (type){
        case MODULE_TYPE.VCO:
            module.Module = VCO;
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
        case MODULE_TYPE.VCA:
            module.Module = VCA;
            break;
        default:
            throw new Error(`Cannot create module of type: ${type}`)
    }
    if (!module.Module.isBrowserSupported) return null;

    module.width = module.Module.panelWidth * ONE_HP_IN_PIXELS;
    moduleCounters[type]++;
    return module;
};