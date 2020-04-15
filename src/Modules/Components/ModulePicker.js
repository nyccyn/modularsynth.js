import React from 'react';
import * as actions from '../actions';
import { MODULE_TYPE } from '../moduleFactory';
import { useAction } from '../../storeHelpers';

const ModulePicker = () => {
    const addModule = useAction(actions.addModule);
    return <div>
        <button onClick={() => addModule(MODULE_TYPE.KEYBOARD)}>Add Keyboard</button>
        <button onClick={() => addModule(MODULE_TYPE.VCO)}>Add VCO</button>
        <button onClick={() => addModule(MODULE_TYPE.VCA)}>Add VCA</button>
        <button onClick={() => addModule(MODULE_TYPE.ADSR)}>Add ADSR</button>
        <button onClick={() => addModule(MODULE_TYPE.VCF_LOW_PASS)}>Add VCF Low Pass</button>
        <button onClick={() => addModule(MODULE_TYPE.STEREO_AUDIO_INTERFACE)}>Add Stereo Audio Interface</button>
        <button onClick={() => addModule(MODULE_TYPE.MONO_AUDIO_INTERFACE)}>Add Mono Audio Interface</button>
        <button onClick={() => addModule(MODULE_TYPE.MULTIPLES)}>Add Multiples</button>
    </div>;
};

export default ModulePicker;
