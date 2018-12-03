import React from 'react';
import { connect } from 'react-redux';
import { connectModules, disconnectModule } from '../actions';

const Port = ({ portId, connections, possiblePorts, connectModules, disconnectModule, moduleId, portType }) => {
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

    return <select value={connections[portId] ? JSON.stringify(connections[portId]) : ''} onChange={handleChange}>
        <option value={''}></option>
        {possiblePorts.map(({ moduleId, portId }) => <option key={`${moduleId}-${portId}`} value={JSON.stringify({
            moduleId,
            portId
        })}>{`${moduleId}-${portId}`}</option>)}
    </select>;
};

export default connect(null, { connectModules, disconnectModule })(Port);