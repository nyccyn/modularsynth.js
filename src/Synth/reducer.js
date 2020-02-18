import { handleActions } from 'redux-actions';
import * as ActionTypes from '../actionTypes';
// import * as R from 'ramda';

const initialState = {
    presetLoading: false,
    isDirty: false
};

const setDirty = isDirty => state => ({ ...state, isDirty });

export default handleActions({
    [ActionTypes.LOAD_PRESET_START]: state => ({ ...state, presetLoading: true }),
    [ActionTypes.LOAD_PRESET_FINISH]: state => ({ ...setDirty(false)(state), presetLoading: false  }),
    [ActionTypes.REMOVE_MODULE]: setDirty(true),
    [ActionTypes.ADD_MODULE]: setDirty(true),
    [ActionTypes.REMOVE_CABLE]: setDirty(true),
    [ActionTypes.ADD_CABLE]: setDirty(true)
}, initialState);