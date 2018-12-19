import React from 'react';
import { connect } from 'react-redux';
import { connectModules, disconnectModule, setStartingPort, unsetStartingPort } from '../actions';
import { getAllOutputs, getAllInputs } from '../selectors';
import cx from 'classnames';
import './Port.css';

const Port = ({ portId, connections, connectModules, disconnectModule, moduleId, portType, possibleInputs, possibleOutputs, startingPort, setStartingPort, unsetStartingPort }) => {
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

    const handleMouseDown = () => {
        setStartingPort({ portId, portType, moduleId });
    };

    const handleMouseUp = e => {
        e.stopPropagation();
        unsetStartingPort();
        if (!startingPort ||
            (startingPort.portType === portType) ||
            (startingPort.moduleId === moduleId && startingPort.id === portId)) return;
        connectModules({
            [startingPort.portType]: startingPort,
            [portType]: {
                moduleId: moduleId,
                portId
            }
        });
    }

    const possiblePorts = portType === 'input' ? possibleOutputs : possibleInputs;
    return <div className={cx('port', { disabled: startingPort && startingPort.portType === portType })}
    onMouseDown={ handleMouseDown }
    onMouseUp={ handleMouseUp }
    >
    </div>;
    // return <select value={connections[portId] ? JSON.stringify(connections[portId]) : ''} onChange={handleChange}>
    //     <option value={''}></option>
    //     {possiblePorts.map(({ moduleId, portId }) => <option key={`${moduleId}-${portId}`} value={JSON.stringify({
    //         moduleId,
    //         portId
    //     })}>{`${moduleId}-${portId}`}</option>)}
    // </select>;
};

const mapStateToProps = ({ modules }) => ({
    possibleInputs: getAllInputs(modules),
    possibleOutputs: getAllOutputs(modules),
    startingPort: modules.startingPort
});

export default connect(mapStateToProps, { connectModules, disconnectModule, setStartingPort, unsetStartingPort })(Port);