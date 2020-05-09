import React, { useState, useEffect, useCallback } from 'react';
import * as R from 'ramda';
import defaultPresets from '../defaultPresets';
import { useSelector } from 'react-redux';
import * as actions from '../actions';
import { useAction } from 'storeHelpers';

const PresetManager = () => {
    const isDirty = useSelector(R.path(['rack', 'isDirty']));
    const presetLoading = useSelector(R.path(['rack', 'presetLoading']));

    const loadPreset = useAction(actions.loadPreset);

    const [preset, setPreset] = useState('');

    useEffect(() => {
        if (!presetLoading && isDirty)
        {
            setPreset('');
        }
    }, [isDirty, presetLoading]);

    const handlePresetChange = useCallback(({ target: { value } }) =>
    {        
        setPreset(value);
        loadPreset(defaultPresets[value]);
    }, [loadPreset])

    return <div>
            <select value={preset} onChange={handlePresetChange}>
                {
                    preset === '' && <option value=''>Select Preset</option>
                }
                { R.pipe(
                    R.keys,
                    R.map(p => <option key={p} value={p}>{p}</option>)
                )(defaultPresets) }
            </select>
        </div>;
};

export default PresetManager;