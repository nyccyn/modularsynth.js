import { handleActions } from 'redux-actions';
import * as ActionTypes from '../actionTypes';
import { createModule } from './moduleFactory';
import * as R from 'ramda';

const initialState = {
    modules: {},
    connections: {},
    startingPort: null,
    maxLeft: 20
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

        newModule.left = state.maxLeft;
        return R.evolve({
            modules: R.assoc(newModule.id, newModule),
            connections: R.assoc(newModule.id, {}),
            maxLeft: R.add(newModule.width)
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
    })(state),

    [ActionTypes.MOVE_MODULE]: (state, { moduleId, x }) => {
        const prevLeft = state.modules[moduleId].left;
        const moduleWidth = state.modules[moduleId].width;
        const newLeft = prevLeft + Math.floor((x - prevLeft) / 20) * 20;
        const newRight = newLeft + moduleWidth;

        if (newRight > window.innerWidth) return state;
        
        const isSpaceInUse = R.pipe(
            R.values,
            R.any(
            ({ id, left, width }) => {
                const right = left + width;
                return id !== moduleId &&  (
                    (left >= newLeft && left < newRight) ||
                    (left < newLeft && right > newLeft) ||
                    (left === newLeft && right === newRight)
                );
            }
        ))(state.modules);
        if (isSpaceInUse) return state;

        return R.evolve({
            modules: R.evolve({
                [moduleId]: R.evolve({
                    left: R.always(newLeft)
                })
            }),
            maxLeft: R.max(newLeft + state.modules[moduleId].width)
        })(state);
    },

    [ActionTypes.REMOVE_MODULE]: (state, { moduleId }) => {
        const removedModule = state.modules[moduleId];

        return R.evolve({
            modules: R.dissoc(moduleId),
            maxLeft: lastValue => removedModule.left + removedModule.width === lastValue ? removedModule.left : lastValue
        })(state);
    }
}, initialState);