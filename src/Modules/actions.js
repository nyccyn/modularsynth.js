import * as ActionTypes from '../actionTypes';
import * as R from 'ramda';
import { removeCable } from "../Cables/actions";

export const addModule = (moduleType, id, rackId) => ({
    type: ActionTypes.ADD_MODULE,
    moduleType,
    id,
    rackId
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

export const moveModule = (moduleId, x, rackId) => ({
    type: ActionTypes.MOVE_MODULE,
    moduleId,
    x,
    rackId
});

export const removeModule = moduleId => (dispatch, getState) => {
    const { modules: { modules, connections }, cables: { cables } } = getState();
    const removedModule = modules[moduleId];
    if (!removedModule) return;

    const disconnectPorts =
        R.pipe(
            R.keys,
            R.filter(portId => R.path([moduleId, portId], connections)),
            R.forEach(portId => {
                dispatch(disconnectModule({ moduleId, portId }));
                let cablePortId = `${moduleId}-${portId}`;
                if (!cables[cablePortId])
                {
                    cablePortId = R.pipe(
                        R.filter(R.propEq('toPortId', cablePortId)),
                        R.keys,
                        R.head
                    )(cables);
                }
                dispatch(removeCable(cablePortId));
            })
        );

    if (removedModule.inputs)
    {
        disconnectPorts(removedModule.inputs);
    }
    if (removedModule.outputs)
    {
        disconnectPorts(removedModule.outputs);
    }
    dispatch({
        type: ActionTypes.REMOVE_MODULE,
        moduleId
    })
};

export const removeAllModules = () => (dispatch, getState) => {
    R.pipe(
        R.keys,
        R.map(moduleId => dispatch(removeModule(moduleId)))
    )(getState().modules.modules);
    dispatch({ type: ActionTypes.REMOVE_ALL_MODULES });
};