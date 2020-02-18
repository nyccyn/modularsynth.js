import { combineReducers } from 'redux';
import modules from './Modules/reducer';
import cables from './Cables/reducer'
import rack from './Synth/reducer';

export default combineReducers({ modules, cables, rack });