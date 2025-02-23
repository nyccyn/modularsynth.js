import * as ActionTypes from '../actionTypes';

export const addCable = ({ portId, fromPoint, color }) => ({
    type: ActionTypes.ADD_CABLE,
    portId,
    fromPoint,
    color
});

export const modifyCable = ({ portId, fromPoint, toPoint, toPortId }) => ({
    type: ActionTypes.MODIFY_CABLE,
    portId,
    fromPoint,
    toPoint,
    toPortId
});

export const removeCable = portId => ({
    type: ActionTypes.REMOVE_CABLE,
    portId
});

export const changeOverPort = portId => ({
    type: ActionTypes.CHANGE_OVER_PORT,
    portId
});