import { handleActions } from 'redux-actions';
import * as ActionTypes from '../actionTypes';
import { createModule } from './moduleFactory';
import * as R from 'ramda';

const initialState = {
    modules: {},
    connections: {},
    startingPort: null
};

const removeLastConnection = R.curry(({ moduleId, portId }, connections) => R.when(
    R.pathSatisfies(R.complement(R.isNil), [moduleId, portId]),
    R.pipe(
        R.path([moduleId, portId]),
        input => R.dissocPath([input.moduleId, input.portId], connections)
    ))(connections));

export default handleActions({
    [ActionTypes.ADD_MODULE]: (state, { moduleType, id }) => {
        const newModule = createModule({ type: moduleType, id });
        if (!newModule) {
            window.alert(`Your browser doesn't support this module: ${moduleType}`);
            return state;
        }
        return R.evolve({
            modules: R.assoc(newModule.id, newModule),
            connections: R.assoc(newModule.id, {})
        })(state);
    },
    [ActionTypes.REGISTER_INPUTS]: (state, { id, inputs }) => R.evolve({
        modules: R.evolve({
            [id]: R.assoc('inputs', inputs)
        })
    })(state),
    [ActionTypes.REGISTER_OUTPUTS]: (state, { id, outputs }) => R.evolve({
        modules: R.evolve({
            [id]: R.assoc('outputs', outputs)
        })
    })(state),
    [ActionTypes.CONNECT_MODULES]: (state, { input, output }) => R.evolve({
        connections: R.pipe(
            removeLastConnection(output),
            removeLastConnection(input),
            R.evolve({
                [input.moduleId]: R.assoc(input.portId, { moduleId: output.moduleId, portId: output.portId }),
                [output.moduleId]: R.assoc(output.portId, { moduleId: input.moduleId, portId: input.portId })
            }))
    })(state),
    [ActionTypes.DISCONNECT_MODULE]: (state, { port }) => R.evolve({
        connections: R.pipe(
            removeLastConnection(port),
            R.evolve({
                [port.moduleId]: R.dissoc(port.portId)
            })
        )
    })(state),
    [ActionTypes.SET_STARTING_PORT]: (state, { port }) => R.evolve({
        startingPort: R.always(port)
    })(state),
    [ActionTypes.UNSET_STARTING_PORT]: (state) => R.evolve({
        startingPort: R.always(null)
    })(state)
}, initialState);