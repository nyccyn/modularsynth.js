import React from 'react';
import { connect } from "react-redux";
import { addModule } from '../actions';
import { MODULE_TYPE } from '../moduleFactory';

const ModulePicker = ({ addModule }) => <div>
    <button onClick={() => addModule(MODULE_TYPE.KEYBOARD) }>Add Keyboard</button>
    <button onClick={() => addModule(MODULE_TYPE.OSCILLATOR) }>Add Oscillator</button>
    <button onClick={() => addModule(MODULE_TYPE.AMP) }>Add Amplifier</button>
    <button onClick={() => addModule(MODULE_TYPE.ADSR) }>Add ADSR</button> 
    <button onClick={() => addModule(MODULE_TYPE.VCF) }>Add VCF</button>       
    <button onClick={() => addModule(MODULE_TYPE.STEREO_AUDIO_INTERFACE) }>Add Stereo Audio Interface</button>
    <button onClick={() => addModule(MODULE_TYPE.MONO_AUDIO_INTERFACE) }>Add Mono Audio Interface</button>
</div>;

export default connect(null, { addModule })(ModulePicker);