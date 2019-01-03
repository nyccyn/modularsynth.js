import React from 'react';
import { connect } from 'react-redux';
import { connectModules, disconnectModule, setStartingPort, unsetStartingPort } from '../Modules/actions';
import { addCable, removeCable, modifyCable } from '../Cables/actions';
import cx from 'classnames';
import randomColor from 'randomcolor';
import './Port.css';

const Port = ({ title, portId, connections, connectModules, disconnectModule, moduleId, portType, startingPort, setStartingPort, unsetStartingPort, addCable, removeCable, modifyCable }) => {
    let _elem;
    const handleMouseDown = e => {
        e.stopPropagation();
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
        unsetStartingPort();
        if (!startingPort ||
            (startingPort.portType === portType) ||
            (startingPort.moduleId === moduleId && startingPort.id === portId))
        {
            return;
        }

        e.stopPropagation();
        const { x, y, width, height } = _elem.getBoundingClientRect();

        if (connections[portId] &&
            (connections[portId].moduleId !== startingPort.moduleId || connections[portId].portId !== startingPort.portId)) {
            removeCable(`${connections[portId].moduleId}-${connections[portId].portId}`);
            removeCable(`${moduleId}-${portId}`);
        }

        modifyCable({
            portId: `${startingPort.moduleId}-${startingPort.portId}`,
            toPoint: { x: x + width / 2 , y: y + height / 2 },
            toPortId: `${moduleId}-${portId}`
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
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}>
        {title || portId}
        <img id={`${moduleId}-${portId}`} height="30" width="30" ref={elem => _elem = elem}
             src={require('./port.svg')} alt={`${moduleId}-${portId}`}/>
    </div>;
};

const mapStateToProps = ({ modules }, ownProps) => ({
    startingPort: modules.startingPort,
    connections: modules.connections[ownProps.moduleId]
});

export default connect(mapStateToProps, { connectModules, disconnectModule, setStartingPort, unsetStartingPort, addCable, removeCable, modifyCable })(Port);