import React from 'react';
import { connect } from 'react-redux';
import { connectModules, disconnectModule } from '../actions';
import { getAllOutputs, getAllInputs } from './selectors';

const Port = ({ portId, connections, connectModules, disconnectModule, moduleId, portType, possibleInputs, possibleOutputs }) => {
    const handleChange = ({ target: { value }}) => {
        if (value === '') {
            disconnectModule({
                moduleId,
                portId
            });
        }
        else {
            const port = JSON.parse(value);
            connectModules({
                [portType === 'input' ? 'output' : 'input']: port,
                [portType]: {
                    moduleId: moduleId,
                    portId
                }
            });
        }
    };

    const possiblePorts = portType === 'input' ? possibleOutputs : possibleInputs;
    return <select value={connections[portId] ? JSON.stringify(connections[portId]) : ''} onChange={handleChange}>
        <option value={''}></option>
        {possiblePorts.map(({ moduleId, portId }) => <option key={`${moduleId}-${portId}`} value={JSON.stringify({
            moduleId,
            portId
        })}>{`${moduleId}-${portId}`}</option>)}
    </select>;
};

const mapStateToProps = state => ({
    possibleInputs: getAllInputs(state),
    possibleOutputs: getAllOutputs(state)
});

export default connect(mapStateToProps, { connectModules, disconnectModule })(Port);