import React from 'react';
import { connect } from 'react-redux';
import { connectModules, disconnectModule, setStartingPort, unsetStartingPort } from '../Modules/actions';
import { addCable, removeCable, modifyCable } from '../Cables/actions';
import cx from 'classnames';
import randomColor from 'randomcolor';
import './Port.css';

const Port = ({ portId, connections, connectModules, disconnectModule, moduleId, portType, startingPort, setStartingPort, unsetStartingPort, addCable, removeCable, modifyCable }) => {
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
        {portId}
        <svg id={`${moduleId}-${portId}`} height="30" width="30" ref={elem => _elem = elem}>
            <circle cx="15" cy="15" r="14" stroke="black" strokeWidth="1" fill="grey" />
            <circle cx="15" cy="15" r="10" stroke="black" strokeWidth="1" fill="grey" />
            <circle cx="15" cy="15" r="7" stroke="none" strokeWidth="0" fill="black"/>
        </svg>
    </div>;
};

const mapStateToProps = ({ modules }) => ({
    startingPort: modules.startingPort
});

export default connect(mapStateToProps, { connectModules, disconnectModule, setStartingPort, unsetStartingPort, addCable, removeCable, modifyCable })(Port);