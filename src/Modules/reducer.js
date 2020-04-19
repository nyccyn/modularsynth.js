import { handleActions } from 'redux-actions';
import * as ActionTypes from '../actionTypes';
import { createModule } from './moduleFactory';
import * as R from 'ramda';

const initialState = {
    audioContextInitiliazed: false,
    modules: {},
    connections: {},
    startingPort: null,
    maxLeft: 20,
    racks: [[], []]
};

const removeLastConnection = R.curry(({ moduleId, portId }, connections) => R.when(
    R.pathSatisfies(R.complement(R.isNil), [moduleId, portId]),
    R.pipe(
        R.path([moduleId, portId]),
        input => R.dissocPath([input.moduleId, input.portId], connections)
    ))(connections));

export default handleActions({
    [ActionTypes.ADD_MODULE]: (state, { moduleType, id, rackId = 0 }) => {
        const newModule = createModule({ type: moduleType, id });
        if (!newModule) {
            window.alert(`Your browser doesn't support this module: ${moduleType}`);
            return state;
        }

        newModule.left = state.maxLeft;
        return R.evolve({
            audioContextInitiliazed: R.T,
            modules: R.assoc(newModule.id, newModule),
            connections: R.assoc(newModule.id, {}),
            maxLeft: R.add(newModule.width),
            racks: R.adjust(rackId, R.append(newModule.id))
        })(state);
    },

    [ActionTypes.REGISTER_INPUTS]: (state, { id, inputs }) => R.evolve({
        modules: R.evolve({
            [id]: R.assoc('inputs', inputs)
        })
    })(state),

    [ActionTypes.REGISTER_OUTPUTS]: (state, { id, outputs }) => R.evolve({
        modules: R.evolve({
            [id]: module => {
                R.mapObjIndexed(
                    (audioNode, output) => {                        
                        if (typeof audioNode === "function")
                        {                                               
                            Object.defineProperty(outputs, output, { get: audioNode });                            
                        }                        
                    }
                )(outputs);                
                return {...module, outputs };
            }
        })
    })(state),

    [ActionTypes.CONNECT_MODULES]: (state, { input, output }) => R.evolve({
        connections: R.pipe(
            removeLastConnection(output),
            removeLastConnection(input),
            R.evolve({
                [input.moduleId]: R.assoc(input.portId, { moduleId: output.moduleId, portId: output.portId, counter: 0 }),
                [output.moduleId]: R.assoc(output.portId, { moduleId: input.moduleId, portId: input.portId, counter: 0 })
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

    [ActionTypes.MOVE_MODULE]: (state, { moduleId, x, rackId }) => {        
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
                return id !== moduleId && R.contains(id, state.racks[rackId]) && (
                    (left >= newLeft && left < newRight) ||
                    (left < newLeft && right > newLeft) ||
                    (left === newLeft && right === newRight)
                );
            }
        ))(state.modules);
        if (isSpaceInUse) return state;

        return R.evolve({
            modules: {
                [moduleId]: {
                    left: R.always(newLeft)
                }
            },
            connections: {
                [moduleId]: R.map(R.evolve({ counter: R.inc }))
            },
            racks: racks => {
                const oldRackId = R.findIndex(R.contains(moduleId), racks);
                if (oldRackId === rackId) return racks;
                return R.pipe(
                    R.adjust(oldRackId, R.without([moduleId])),
                    R.adjust(rackId, R.append(moduleId))
                )(racks);
            },
            maxLeft: R.max(newLeft + state.modules[moduleId].width)
        })(state);
    },

    [ActionTypes.REMOVE_MODULE]: (state, { moduleId }) => {
        const removedModule = state.modules[moduleId];

        return R.evolve({
            modules: R.dissoc(moduleId),
            racks: racks => {
                const rackId = R.findIndex(R.contains(moduleId), racks);
                return R.adjust(rackId, R.without([moduleId]))(racks);
            },
            maxLeft: lastValue => removedModule.left + removedModule.width === lastValue ? removedModule.left : lastValue
        })(state);
    }
}, initialState);