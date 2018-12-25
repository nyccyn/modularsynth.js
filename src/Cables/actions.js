import * as ActionTypes from '../actionTypes';

export const addCable = ({ portId, fromPoint, color }) => ({
    type: ActionTypes.ADD_CABLE,
    portId,
    fromPoint,
    color
});

export const modifyCable = ({ portId, toPoint, toPortId }) => ({
    type: ActionTypes.MODIFY_CABLE,
    portId,
    toPoint,
    toPortId
});

export const removeCable = portId => ({
    type: ActionTypes.REMOVE_CABLE,
    portId
});

export const modifyModuleCables = ({ moduleId, diff }) => ({
    type: ActionTypes.MODIFY_MODULE_CABLES,
    moduleId,
    diff
});