import * as ActionTypes from '../actionTypes';

export const addCable = ({ port, fromPoint }) => ({
    type: ActionTypes.ADD_CABLE,
    port,
    fromPoint
});

export const modifyCable = ({ port, fromPoint, toPoint }) => ({
    type: ActionTypes.MODIFY_CABLE,
    port,
    fromPoint,
    toPoint
});

export const removeCable = port => ({
    type: ActionTypes.REMOVE_CABLE,
    port
});