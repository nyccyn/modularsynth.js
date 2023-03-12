import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Select from 'react-select';
import styled from 'styled-components';
import * as R from 'ramda';
import defaultPresets from '../defaultPresets';
import { useSelector } from 'react-redux';
import * as actions from '../actions';
import { useAction } from 'storeHelpers';
import IconButton from 'Common/IconButton';
import { digitalSelectStyle } from 'Common/selectStyles';

const Container = styled.div`
    display: flex;
    flex: 1;
    align-items: center;

    > * {
        margin: 0 10px;
    }
`;

const PresetSelect = styled(Select)`
    flex: 1;
    max-width: 200px;
`;

const PresetManager = () => {
    const isDirty = useSelector(R.path(['rack', 'isDirty']));
    const presetLoading = useSelector(R.path(['rack', 'presetLoading']));

    const loadPreset = useAction(actions.loadPreset);
    const savePreset = useAction(actions.savePreset);

    const [preset, setPreset] = useState('');

    useEffect(() => {
        if (!presetLoading && isDirty) {
            setPreset('');
        }
    }, [isDirty, presetLoading]);

    const presetOptions = useMemo(() => {
        return R.pipe(
            R.keys,
            R.map(preset => ({ value: preset, label: preset }))
        )(defaultPresets);
    }, []);

    const handlePresetChange = useCallback(({ value }) => {
        setPreset(value);
        loadPreset(defaultPresets[value]);
    }, [loadPreset])

    const handleLoadPreset = useCallback(() => {
        const preset = localStorage.getItem('preset')
        if (preset) {
            loadPreset(JSON.parse(preset));
        }
    }, [loadPreset]);

    return <Container>
        <IconButton icon='file-download' title='Save' onClick={savePreset}/>
        <IconButton icon='file-upload' title='Load' onClick={handleLoadPreset}/>
        <PresetSelect options={presetOptions} onChange={handlePresetChange} placeholder='Select Preset'
            components={{ IndicatorSeparator:() => null }}
            styles={digitalSelectStyle}
        />       
    </Container>;
};

export default PresetManager;