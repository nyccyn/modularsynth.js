import { MODULE_TYPE } from '../Modules/moduleFactory';

export default {
  Basic: {
      modules: [
          { type: MODULE_TYPE.KEYBOARD, id: 'KEYBOARD1' },
          { type: MODULE_TYPE.VCO, id: 'VCO1' },
          { type: MODULE_TYPE.ADSR, id: 'ADSR1' },
          { type: MODULE_TYPE.VCA, id: 'VCA1' },
          { type: MODULE_TYPE.MONO_AUDIO_INTERFACE, id: 'MONO_AUDIO_INTERFACE1' }
      ],
      connections: [
          { input: { moduleId: 'VCO1', portId: 'V/Oct' }, output: { moduleId: 'KEYBOARD1', portId: 'CV' } },
          { input: { moduleId: 'ADSR1', portId: 'Gate' }, output: { moduleId: 'KEYBOARD1', portId: 'Gate' } },
          { input: { moduleId: 'VCA1', portId: 'In' }, output: { moduleId: 'VCO1', portId: 'Sine' } },
          { input: { moduleId: 'VCA1', portId: 'CV' }, output: { moduleId: 'ADSR1', portId: 'Out' } },
          { input: { moduleId: 'MONO_AUDIO_INTERFACE1', portId: 'In' }, output: { moduleId: 'VCA1', portId: 'Out' } }
      ]
  }
};