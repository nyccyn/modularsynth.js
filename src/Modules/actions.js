import * as ActionTypes from '../actionTypes';

export const addModule = moduleType => ({
    type: ActionTypes.ADD_MODULE,
    moduleType
});

export const connectModules = ({ output, input }) => ({
    type: ActionTypes.CONNECT_MODULES,
    output,
    input
});

export const disconnectModule = port => ({
    type: ActionTypes.DISCONNECT_MODULE,
    port
});

export const registerInputs = (id, inputs) => ({
    type: ActionTypes.REGISTER_INPUTS,
    id,
    inputs
});

export const registerOutputs = (id, outputs) => ({
    type: ActionTypes.REGISTER_OUTPUTS,
    id,
    outputs
});

export const setStartingPort = port => ({
    type: ActionTypes.SET_STARTING_PORT,
    port
});

export const unsetStartingPort = () => ({
    type: ActionTypes.UNSET_STARTING_PORT
});
