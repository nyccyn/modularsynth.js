import * as R from 'ramda';
import * as actionType from './actionTypes';

const middleware = ({ getState }) => next => action => {
    switch  (action.type) {
        case actionType.CONNECT_MODULES: {
            const { modules, connections } = getState().modules;
            const input = R.path([action.input.moduleId, 'inputs', action.input.portId])(modules);
            const output = R.path([action.output.moduleId, 'outputs', action.output.portId])(modules);

            R.pipe(
                R.path([action.output.moduleId, action.output.portId]),
                R.unless(R.isNil, R.pipe(
                    ({ moduleId, portId }) => R.path([moduleId, 'inputs', portId])(modules),
                    lastInput => lastInput.disconnect(output)
                ))
            )(connections);
            R.pipe(
                R.path([action.input.moduleId, action.input.portId]),
                R.unless(R.isNil, R.pipe(
                    ({ moduleId, portId }) => R.path([moduleId, 'outputs', portId])(modules),
                    lastOutput => input.disconnect(lastOutput)
                ))
            )(connections);

            input.connect(output);
            break;
        }
        case actionType.DISCONNECT_MODULE: {
            const { modules, connections } = getState().modules;
            const input = R.path([action.port.moduleId, 'inputs', action.port.portId])(modules);
            if (input) {
                R.pipe(
                    R.path([action.port.moduleId, action.port.portId]),
                    ({ moduleId, portId }) => R.path([moduleId, 'outputs', portId])(modules),
                    output => input.disconnect(output)
                )(connections);
            }
            else {
                const output = R.path([action.port.moduleId, 'outputs', action.port.portId])(modules);
                R.pipe(
                    R.path([action.port.moduleId, action.port.portId]),
                    ({ moduleId, portId }) => R.path([moduleId, 'inputs', portId])(modules),
                    input => input.disconnect(output)
                )(connections);
            }
        }
    }

    return next(action);
};

export default middleware;