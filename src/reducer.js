import { combineReducers } from 'redux';
import modules from './Modules/reducer';
import cables from './Cables/reducer'

export default combineReducers({ modules, cables });