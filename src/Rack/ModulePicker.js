import React from 'react';
import { connect } from "react-redux";
import { addModule } from '../actions';
import { MODULE_TYPE } from '../Modules/moduleFactory';

const ModulePicker = ({ addModule }) => <div>
    <button onClick={() => addModule(MODULE_TYPE.OSCILLATOR) }>Add Oscillator</button>
    <button onClick={() => addModule(MODULE_TYPE.AUDIO_INTERFACE) }>Add Audio Interface</button>
</div>;

export default connect(null, { addModule })(ModulePicker);