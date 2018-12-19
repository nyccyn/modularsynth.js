import * as ActionTypes from '../actionTypes';

export const addCable = ({ portId, fromPoint, color }) => ({
    type: ActionTypes.ADD_CABLE,
    portId,
    fromPoint,
    color
});

export const modifyCable = ({ portId, toPoint }) => ({
    type: ActionTypes.MODIFY_CABLE,
    portId,
    toPoint
});

export const removeCable = portId => ({
    type: ActionTypes.REMOVE_CABLE,
    portId
});