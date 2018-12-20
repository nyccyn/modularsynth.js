import { MODULE_TYPE } from '../Modules/moduleFactory';

export default {
  Basic: {
      modules: [
          { type: MODULE_TYPE.KEYBOARD, id: 'KEYBOARD1' },
          { type: MODULE_TYPE.OSCILLATOR, id: 'OSCILLATOR1' },
          { type: MODULE_TYPE.ADSR, id: 'ADSR1' },
          { type: MODULE_TYPE.AMP, id: 'AMP1' },
          { type: MODULE_TYPE.MONO_AUDIO_INTERFACE, id: 'MONO_AUDIO_INTERFACE1' }
      ],
      connections: [
          { input: { moduleId: 'OSCILLATOR1', portId: 'V/Oct' }, output: { moduleId: 'KEYBOARD1', portId: 'CV' } },
          { input: { moduleId: 'ADSR1', portId: 'Gate' }, output: { moduleId: 'KEYBOARD1', portId: 'Gate' } },
          { input: { moduleId: 'AMP1', portId: 'In' }, output: { moduleId: 'OSCILLATOR1', portId: 'Out' } },
          { input: { moduleId: 'AMP1', portId: 'CV' }, output: { moduleId: 'ADSR1', portId: 'Out' } },
          { input: { moduleId: 'MONO_AUDIO_INTERFACE1', portId: 'In' }, output: { moduleId: 'AMP1', portId: 'Out' } }
      ]
  }
};