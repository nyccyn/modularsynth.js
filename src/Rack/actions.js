import * as R from 'ramda';
import { addModule, connectModules } from '../Modules/actions';
import { addCable, modifyCable } from '../Cables/actions';
import randomColor from 'randomcolor';

const connectModulesAndCables = R.curry((dispatch, getState, connection) => {
    const { input, output } = connection;
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
        toPortId: `${output.moduleId}-${output.portId}`,
        toPoint: {
            x: toElem.x + toElem.width / 2,
            y: toElem.y + toElem.height / 2
        }
    }));
});

export const loadPreset = preset => (dispatch, getState) => {
    R.forEach(module => dispatch(addModule(module.type, module.id)))(preset.modules);
    setTimeout(() => R.forEach(connectModulesAndCables(dispatch, getState))(preset.connections), 250);
};