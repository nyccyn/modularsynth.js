import { combineReducers } from 'redux';
import modules from './Modules/reducer';
import cables from './Cables/reducer'
import rack from './Rack/reducer';

export default combineReducers({ modules, cables, rack });