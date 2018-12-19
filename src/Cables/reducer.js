import { handleActions } from 'redux-actions';
import * as ActionTypes from '../actionTypes';
import * as R from 'ramda';

const initialState = {
    cables: {}
};

export default handleActions({
    [ActionTypes.ADD_CABLE]: (state, { port, fromPoint }) => R.evolve({
        cables: R.assoc(port, { fromPoint, toPoint: fromPoint })
    })(state),
    [ActionTypes.MODIFY_CABLE]: (state, { port, fromPoint, toPoint }) => R.evolve({
        cables: R.evolve({
            [port]: R.always({ fromPoint, toPoint })
        })
    })(state),
    [ActionTypes.REMOVE_CABLE]: (stable, port) => R.evolve({
        cables: R.dissoc(port)
    })(state)
}, initialState);