import * as R from 'ramda';
import { addModule, connectModules, removeAllModules } from '../Modules/actions';
import { addCable, modifyCable } from '../Cables/actions';
import randomColor from 'randomcolor';
import { LOAD_PRESET_START, LOAD_PRESET_FINISH, SAVE_PRESET } from '../actionTypes';

export const savePreset = () => ({
    type: SAVE_PRESET
});

const connectModulesAndCables = R.curry((dispatch, connection) => {
    const { input, output } = connection;
    dispatch(connectModules(connection));

    const fromPortId = `${input.moduleId}-${input.portId}`;
    const fromElem = document.getElementById(fromPortId).getBoundingClientRect();
    dispatch(addCable({
        portId: fromPortId,
        color: randomColor({ luminosity: 'dark' }),
        fromPoint: {
            x: fromElem.x + fromElem.width / 2,
            y: fromElem.y + fromElem.height / 2
        }
    }));

    const toElem = document.getElementById(`${output.moduleId}-${output.portId}`).getBoundingClientRect();
    dispatch(modifyCable({
        portId: fromPortId,
        toPortId: `${output.moduleId}-${output.portId}`,
        toPoint: {
            x: toElem.x + toElem.width / 2,
            y: toElem.y + toElem.height / 2
        }
    }));
});

export const loadPreset = preset => (dispatch, getState) => {
    dispatch({ type: LOAD_PRESET_START });
    dispatch(removeAllModules());
    setTimeout(checkIfAllModulesRemoves(dispatch, getState, preset), 10);
};

const checkIfAllModulesRemoves = (dispatch, getState, preset) => () => {
    if (!R.isEmpty(getState().modules.modules)) {
        setTimeout(checkIfAllModulesRemoves(dispatch, getState, preset), 10);
    }
    else {
        R.forEach(module => dispatch(addModule(module)))(preset.modules);
        setTimeout(checkIfModulesCreated(dispatch, getState, preset), 10);
    }
};

const checkIfModulesCreated = (dispatch, getState, preset) => () => {
    const stateModuleIds = R.map(R.prop('id'), getState().modules.modules);
    const moduleIds = R.map(R.prop('id'), preset.modules);

    if (!R.isEmpty(R.difference(stateModuleIds, moduleIds))) {
        setTimeout(checkIfModulesCreated(dispatch, getState, preset), 10);
    }
    else {
        R.forEach(connectModulesAndCables(dispatch))(preset.connections);
        setTimeout(checkIfAllConnected(dispatch, getState, preset.connections), 50);
    }
};

const checkIfAllConnected = (dispatch, getState, connections) => () => {
    const stateConnections = getState().modules.connections;
    const allConnected  = R.all(connection => {
        const stateConnection = stateConnections[connection.input.moduleId];
        if (!stateConnection) return false;

        const port = stateConnection[connection.input.portId];
        return port && port.moduleId === connection.output.moduleId && port.portId === connection.output.portId;
    }, connections);

    if (!allConnected) {
        setTimeout(checkIfAllConnected(dispatch, getState, connections), 10);
    } else {
        dispatch({ type: LOAD_PRESET_FINISH });
    }
};