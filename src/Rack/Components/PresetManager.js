import React from 'react';
import * as R from 'ramda';
import { compose, withState } from 'recompose';
import defaultPresets from '../defaultPresets';
import { connect } from 'react-redux';
import { loadPreset } from '../actions';

const PresetManager = ({ preset, setPreset, loadPreset }) => {

    const handlePresetChange = ({ target: { value }}) => {
      setPreset(value);
        loadPreset(defaultPresets[value]);
    };

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

export default compose(
    withState('preset', 'setPreset', ''),
    connect(null, { loadPreset })
)(PresetManager);