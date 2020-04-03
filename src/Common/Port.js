import React, { useEffect, useRef } from 'react';
import * as R from 'ramda';
import { connect } from 'react-redux';
import { connectModules, disconnectModule, setStartingPort, unsetStartingPort } from '../Modules/actions';
import { addCable, removeCable, modifyCable } from '../Cables/actions';
import cx from 'classnames';
import randomColor from 'randomcolor';
import './Port.css';

export const LABEL_POSITIONS = {
    ABOVE: 'ABOVE',
    BELOW: 'BELOW'
}

const Port = ({ label, labelPosition = LABEL_POSITIONS.ABOVE, portId, connection, connectModules, disconnectModule,
    moduleId, portType, startingPort, setStartingPort, unsetStartingPort, addCable, removeCable, modifyCable, cables }) => {

        const imgElem = useRef(null);

    useEffect(() => {        
        const fromPortCable = R.find(R.whereEq({ portId: `${moduleId}-${portId}` }), cables);
        if (fromPortCable) {
            const { x, y, width, height } = imgElem.current.getBoundingClientRect();
            modifyCable({
                portId: fromPortCable.portId,
                fromPoint: { x: x + width / 2, y: y + window.scrollY + height / 2 },
            });
        }
        else {
            const toPortCable = R.find(R.whereEq({ toPortId: `${moduleId}-${portId}` }), cables);
            if (toPortCable) {
                const { x, y, width, height } = imgElem.current.getBoundingClientRect();
                modifyCable({
                    portId: toPortCable.portId,
                    toPoint: { x: x + width / 2, y: y + window.scrollY + height / 2 },
                });
            }
        }
    }, [connection]);
    
    const handleMouseDown = e => {
        e.stopPropagation();
        const port = { portId, portType, moduleId };
        if (connection) {
            disconnectModule({
                moduleId,
                portId
            });
            removeCable(`${connection.moduleId}-${connection.portId}`);
        }

        setStartingPort(port);
        const { x, y, width, height } = imgElem.current.getBoundingClientRect();
        
        addCable({
            portId: `${moduleId}-${portId}`,
            fromPoint: { x: x + width / 2, y: y + window.scrollY + height / 2 },
            color: randomColor({ luminosity: 'dark' })
        });
    };

    const handleMouseUp = e => {
        unsetStartingPort();
        if (!startingPort ||
            (startingPort.portType === portType) ||
            (startingPort.moduleId === moduleId && startingPort.id === portId)) {
            return;
        }

        e.stopPropagation();
        const { x, y, width, height } = imgElem.current.getBoundingClientRect();

        if (connection &&
            (connection.moduleId !== startingPort.moduleId || connection.portId !== startingPort.portId)) {
            removeCable(`${connection.moduleId}-${connection.portId}`);
            removeCable(`${moduleId}-${portId}`);
        }        

        modifyCable({
            portId: `${startingPort.moduleId}-${startingPort.portId}`,
            toPoint: { x: x + width / 2, y: y + height / 2 },
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

    const portLabel = label || portId;
    return <div className={cx('port', { disabled: startingPort && startingPort.portType === portType })}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}>
        {labelPosition === LABEL_POSITIONS.ABOVE && portLabel}
        <img id={`${moduleId}-${portId}`} height="30" width="30" ref={imgElem}
            onMouseDown={e => e.preventDefault()} src={require('./port.svg')} alt={`${moduleId}-${portId}`} />
        {labelPosition === LABEL_POSITIONS.BELOW && portLabel}
    </div>;
};

const mapStateToProps = ({ modules, cables }, ownProps) => ({
    startingPort: modules.startingPort,
    connection: modules.connections[ownProps.moduleId][ownProps.portId],
    cables: R.values(cables.cables)
});

export default connect(mapStateToProps, { connectModules, disconnectModule, setStartingPort, unsetStartingPort, addCable, removeCable, modifyCable })(Port);