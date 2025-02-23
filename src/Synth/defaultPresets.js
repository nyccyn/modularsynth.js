import Sequencer from 'Modules/Components/Sequencer';
import { MODULE_TYPE } from '../Modules/moduleFactory';

export default {
  Basic: {
      modules: [
          { type: MODULE_TYPE.KEYBOARD, id: 'KEYBOARD1' },
          { type: MODULE_TYPE.VCO, id: 'VCO1' },
          { type: MODULE_TYPE.VCF_LOW_PASS, id: 'VCF1' },
          { type: MODULE_TYPE.ADSR, id: 'ADSR1' },
          { type: MODULE_TYPE.VCA, id: 'VCA1' },
          { type: MODULE_TYPE.MONO_AUDIO_INTERFACE, id: 'MONO_AUDIO_INTERFACE1' }
      ],
      connections: [
          { input: { moduleId: 'VCO1', portId: 'CV1' }, output: { moduleId: 'KEYBOARD1', portId: 'CV' } },
          { input: { moduleId: 'VCF1', portId: 'In' }, output: { moduleId: 'VCO1', portId: 'Sine' } },
          { input: { moduleId: 'ADSR1', portId: 'Gate' }, output: { moduleId: 'KEYBOARD1', portId: 'Gate' } },
          { input: { moduleId: 'VCA1', portId: 'AudioIn1' }, output: { moduleId: 'VCF1', portId: 'Out' } },
          { input: { moduleId: 'VCA1', portId: 'CV1' }, output: { moduleId: 'ADSR1', portId: 'Out1' } },
          { input: { moduleId: 'MONO_AUDIO_INTERFACE1', portId: 'In' }, output: { moduleId: 'VCA1', portId: 'AudioOut' } }
      ]
  },
  Sequencer: {
    modules: [
        { 
            type: MODULE_TYPE.SEQUENCER, 
            id: 'SEQUENCER1', 
            stepNumber: 8,
            channelMode: 'SERIES',
            channelFrequencies: [
                [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5],
                [1,0,-1,0,1,0,-1,0]
            ]
        },
        { type: MODULE_TYPE.VCO, id: 'VCO1' },
        { type: MODULE_TYPE.VCF_LOW_PASS, id: 'VCF1' },
        { type: MODULE_TYPE.ADSR, id: 'ADSR1' },
        { type: MODULE_TYPE.VCA, id: 'VCA1' },
        { type: MODULE_TYPE.MONO_AUDIO_INTERFACE, id: 'MONO_AUDIO_INTERFACE1' }
    ],
    connections: [
        { input: { moduleId: 'VCO1', portId: 'CV1' }, output: { moduleId: 'SEQUENCER1', portId: 'CV1' } },
        { input: { moduleId: 'VCF1', portId: 'In' }, output: { moduleId: 'VCO1', portId: 'Sawtooth' } },
        { input: { moduleId: 'ADSR1', portId: 'Gate' }, output: { moduleId: 'SEQUENCER1', portId: 'Gate' } },
        { input: { moduleId: 'VCA1', portId: 'AudioIn1' }, output: { moduleId: 'VCF1', portId: 'Out' } },
        { input: { moduleId: 'VCA1', portId: 'CV1' }, output: { moduleId: 'ADSR1', portId: 'Out1' } },
        { input: { moduleId: 'MONO_AUDIO_INTERFACE1', portId: 'In' }, output: { moduleId: 'VCA1', portId: 'AudioOut' } }
    ]
}
};