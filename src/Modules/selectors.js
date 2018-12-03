import { createSelector } from 'reselect'
import * as R from 'ramda';

const modulesSelector = state => state.modules;

const getPorts = portType => R.pipe(
    R.pluck(portType),
    R.reject(R.isNil),
    R.mapObjIndexed((ports, moduleId) => R.pipe(
        R.mapObjIndexed((port, portId) => ({ moduleId, portId, port })),
        R.values
    )(ports)),
    R.values,
    R.unnest
);

export const getAllInputs = createSelector(
    modulesSelector,
    getPorts('inputs')
);

export const getAllOutputs = createSelector(
    modulesSelector,
    getPorts('outputs')
);
