import { handleActions } from 'redux-actions';
import * as ActionTypes from '../actionTypes';
import * as R from 'ramda';

const initialState = {
    cables: {}
};

const moveX = diff => R.evolve({
    x: R.add(diff)
});

export default handleActions({

    [ActionTypes.ADD_CABLE]: (state, { portId, fromPoint, color }) => R.evolve({
        cables: R.assoc(portId, { portId, fromPoint, toPoint: fromPoint, color })
    })(state),

    [ActionTypes.MODIFY_CABLE]: (state, { portId, toPoint, toPortId }) => R.evolve({
        cables: R.evolve({
            [portId]: R.merge(R.__, { toPoint, toPortId })
        })
    })(state),

    [ActionTypes.REMOVE_CABLE]: (state, { portId }) => R.evolve({
        cables: R.dissoc(portId)
    })(state),

    [ActionTypes.MODIFY_MODULE_CABLES]: (state, { moduleId, diff }) => R.evolve({
        cables: R.map(R.cond([
            [R.where({ portId: R.startsWith(moduleId) }), R.evolve({ fromPoint: moveX(diff) })],
            [R.where({ toPortId: R.startsWith(moduleId) }), R.evolve({ toPoint: moveX(diff) })],
            [R.T, R.identity]
        ]))
    })(state)

}, initialState);