import React, { Component } from 'react';
import * as R from 'ramda';
import { compose, withState } from 'recompose';
import defaultPresets from '../defaultPresets';
import { connect } from 'react-redux';
import { loadPreset } from '../actions';

class PresetManager extends Component {
    constructor(props)
    {
        super(props);
        this.handlePresetChange = this.handlePresetChange.bind(this);
    }

    componentDidUpdate(prevProps)
    {
        const { isDirty, setPreset, presetLoading } = this.props;
        if (!presetLoading && isDirty && !prevProps.isDirty)
        {
            setPreset('');
        }
    }

    handlePresetChange({ target: { value } })
    {
        const { loadPreset, setPreset } = this.props;
        setPreset(value);
        loadPreset(defaultPresets[value]);
    }

    render()
    {
        const { preset } = this.props;
        return <div>
            <select value={preset} onChange={this.handlePresetChange}>
                {
                    preset === '' && <option value=''>Select Preset</option>
                }
                { R.pipe(
                    R.keys,
                    R.map(p => <option key={p} value={p}>{p}</option>)
                )(defaultPresets) }
            </select>
        </div>;
    }
}

const mapStateToProps = ({ rack }) => ({
    isDirty: rack.isDirty,
    presetLoading: rack.presetLoading
});

export default compose(
    withState('preset', 'setPreset', ''),
    connect(mapStateToProps, { loadPreset })
)(PresetManager);