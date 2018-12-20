import * as R from 'ramda';
import { addModule, connectModules } from '../Modules/actions';
import { addCable, modifyCable } from '../Cables/actions';
import randomColor from 'randomcolor';

const tryToConnectModules = R.curry((dispatch, getState, connection) => {
    const state = getState().modules;
    const { input, output } = connection;
    if (R.allPass([
            R.path([input.moduleId, 'inputs', input.portId]),
            R.path([output.moduleId, 'outputs', output.portId])])(state.modules))
    {
        dispatch(connectModules(connection));

        const fromPortId = `${input.moduleId}-${input.portId}`;
        const fromElem = document.getElementById(fromPortId).getBoundingClientRect();
        dispatch(addCable({
            portId: fromPortId,
            color: randomColor({ luminosity: 'dark' }),
            fromPoint: {
                x: fromElem.x + fromElem.width / 2,
                y: fromElem.y + fromElem.height / 2
            }
        }));

        const toElem = document.getElementById(`${output.moduleId}-${output.portId}`).getBoundingClientRect();
        dispatch(modifyCable({
            portId: fromPortId,
            toPoint: {
                x: toElem.x + toElem.width / 2,
                y: toElem.y + toElem.height / 2
            }
        }));
    }
    else {
        setTimeout(() => tryToConnectModules(dispatch, getState, connection), 0);
    }
});

export const loadPreset = preset => (dispatch, getState) => {
    R.forEach(module => dispatch(addModule(module.type, module.id)))(preset.modules);
    R.forEach(tryToConnectModules(dispatch, getState))(preset.connections);
};