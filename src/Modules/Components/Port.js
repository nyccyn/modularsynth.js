import React from 'react';
import { connect } from 'react-redux';
import { connectModules, disconnectModule, setStartingPort, unsetStartingPort } from '../actions';
import { addCable, removeCable, modifyCable } from '../../Cables/actions';
import cx from 'classnames';
import randomColor from 'randomcolor';
import './Port.css';

const Port = ({ portId, connections, connectModules, disconnectModule, moduleId, portType, startingPort, setStartingPort, unsetStartingPort, addCable, removeCable, modifyCable }) => {
    let _elem;
    const handleMouseDown = () => {
        const port = { portId, portType, moduleId };
        if (connections[portId]) {
            disconnectModule({
                moduleId,
                portId
            });
            removeCable(`${connections[portId].moduleId}-${connections[portId].portId}`);
        }

        setStartingPort(port);
        const { x, y, width, height } = _elem.getBoundingClientRect();
        addCable({
            portId: `${moduleId}-${portId}`,
            fromPoint: { x: x + width / 2 , y: y + height / 2 },
            color: randomColor({ luminosity: 'dark' })
        });
    };

    const handleMouseUp = e => {
        e.stopPropagation();
        unsetStartingPort();
        if (!startingPort ||
            (startingPort.portType === portType) ||
            (startingPort.moduleId === moduleId && startingPort.id === portId)) return;

        const { x, y, width, height } = _elem.getBoundingClientRect();

        console.log('connections', connections[portId]);
        console.log('startingPort', startingPort);
        if (connections[portId] &&
            (connections[portId].moduleId !== startingPort.moduleId || connections[portId].portId !== startingPort.portId)) {
            removeCable(`${connections[portId].moduleId}-${connections[portId].portId}`);
            removeCable(`${moduleId}-${portId}`);
        }

        modifyCable({
            portId: `${startingPort.moduleId}-${startingPort.portId}`,
            toPoint: { x: x + width / 2 , y: y + height / 2 }
        });
        connectModules({
            [startingPort.portType]: startingPort,
            [portType]: {
                moduleId: moduleId,
                portId
            }
        });
    };

    return <div className={cx('port', { disabled: startingPort && startingPort.portType === portType })}
                ref={elem => _elem = elem}
                onMouseDown={ handleMouseDown }
                onMouseUp={ handleMouseUp }>
    </div>;
};

const mapStateToProps = ({ modules }) => ({
    startingPort: modules.startingPort
});

export default connect(mapStateToProps, { connectModules, disconnectModule, setStartingPort, unsetStartingPort, addCable, removeCable, modifyCable })(Port);