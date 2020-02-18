import { handleActions } from 'redux-actions';
import * as ActionTypes from '../actionTypes';
import * as R from 'ramda';

const initialState = {
    cables: {}
};

export default handleActions({

    [ActionTypes.ADD_CABLE]: (state, { portId, fromPoint, color }) => R.evolve({
        cables: R.assoc(portId, { portId, fromPoint, toPoint: fromPoint, color })
    })(state),

    [ActionTypes.MODIFY_CABLE]: (state, { portId, fromPoint, toPoint, toPortId }) => R.evolve({
        cables: R.evolve({
            [portId]: R.merge(R.__, R.reject(R.isNil, ({ fromPoint, toPoint, toPortId })))
        })
    })(state),

    [ActionTypes.REMOVE_CABLE]: (state, { portId }) => R.evolve({
        cables: R.dissoc(portId)
    })(state)

}, initialState);