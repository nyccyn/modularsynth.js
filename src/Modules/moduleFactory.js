import * as R from 'ramda';
import VCO from './Components/VCO';
import StereoAudioInterface from './Components/StereoAudioInterface';
import MonoAudioInterface from './Components/MonoAudioInterface';
import Keyboard from './Components/Keyboard';
import ADSR from './Components/ADSR';
import VCA from './Components/VCA';
import VCFLowPass from './Components/VCFLowPass';
import Multiples from './Components/Multiples';
import LFO from './Components/LFO';
import MidiToCv from './Components/MidiToCv';
import Mixer from './Components/Mixer';
import Sequencer from './Components/Sequencer';

export const MODULE_TYPE = {
    VCO: 'VCO',
    STEREO_AUDIO_INTERFACE: 'STEREO_AUDIO_INTERFACE',
    MONO_AUDIO_INTERFACE: 'MONO_AUDIO_INTERFACE',
    KEYBOARD: 'KEYBOARD',
    ADSR: 'ADSR',
    VCA: 'VCA',
    VCF_LOW_PASS: 'VCF_LOW_ASS',
    MULTIPLES: 'MULTIPLES',
    LFO: 'LFO',
    MIDI_CV: 'MIDI_CV',
    MIXER: 'MIXER',
    SEQUENCER: 'SEQUENCER'
};

const moduleCounters = R.map(R.always(1))(MODULE_TYPE);

const ONE_HP_IN_PIXELS = 16;

export const createModule = ({ type, id = undefined, ...otherProps }) => {
    const module = { id: id || `${type}${moduleCounters[type]}`, type, ...otherProps };
    switch (type) {
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
        case MODULE_TYPE.VCF_LOW_PASS:
            module.Module = VCFLowPass;
            break;
        case MODULE_TYPE.VCA:
            module.Module = VCA;
            break;
        case MODULE_TYPE.MULTIPLES:
            module.Module = Multiples;
            break;
        case MODULE_TYPE.LFO:
            module.Module = LFO;
            break;
        case MODULE_TYPE.MIDI_CV:
            module.Module = MidiToCv;
            break;
        case MODULE_TYPE.MIXER:
            module.Module = Mixer;
            break;
        case MODULE_TYPE.SEQUENCER:
            module.Module = Sequencer;
            break;
        default:
            throw new Error(`Cannot create module of type: ${type}`)
    }
    if (!module.Module.isBrowserSupported) return null;

    module.width = module.Module.panelWidth * ONE_HP_IN_PIXELS;
    module.title = module.Module.title || type;
    moduleCounters[type]++;
    return module;
};
