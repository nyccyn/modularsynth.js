import React, { useEffect, useRef, useMemo } from 'react';
import * as R from 'ramda';
import { useSelector } from 'react-redux';
import * as modulesActions from '../Modules/actions';
import * as cablesActions from '../Cables/actions';
import cx from 'classnames';
import randomColor from 'randomcolor';
import './Port.css';
import { useAction } from '../storeHelpers';

export const LABEL_POSITIONS = {
    HIDE: 'HIDE',
    ABOVE: 'ABOVE',
    BELOW: 'BELOW'
}

const Port = ({ label, labelPosition = LABEL_POSITIONS.ABOVE, portId, moduleId, portType }) => {
    const startingPort = useSelector(R.path(['modules', 'startingPort']));
    const connection = useSelector(R.path(['modules', 'connections', moduleId, portId]));
    const cables = useSelector(R.pipe(R.path(['cables', 'cables']), R.values));

    const connectModules = useAction(modulesActions.connectModules);
    const disconnectModule = useAction(modulesActions.disconnectModule);
    const setStartingPort = useAction(modulesActions.setStartingPort);
    const unsetStartingPort = useAction(modulesActions.unsetStartingPort);
    const addCable = useAction(cablesActions.addCable);
    const removeCable = useAction(cablesActions.removeCable);
    const modifyCable = useAction(cablesActions.modifyCable);
    const changeOverPort = useAction(cablesActions.changeOverPort);

    const fullPortId = useMemo(() => `${moduleId}-${portId}`, [moduleId, portId]);

    const imgElem = useRef(null);

    useEffect(() => {
        const fromPortCable = R.find(R.whereEq({ portId: fullPortId }), cables);
        if (fromPortCable) {
            const { x, y, width, height } = imgElem.current.getBoundingClientRect();
            modifyCable({
                portId: fromPortCable.portId,
                fromPoint: { x: x + width / 2, y: y + window.scrollY + height / 2 },
            });
        }
        else {
            const toPortCable = R.find(R.whereEq({ toPortId: fullPortId }), cables);
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
            removeCable(fullPortId);
        }

        setStartingPort(port);
        const { x, y, width, height } = imgElem.current.getBoundingClientRect();

        addCable({
            portId: fullPortId,
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
            removeCable(fullPortId);
        }

        modifyCable({
            portId: `${startingPort.moduleId}-${startingPort.portId}`,
            toPoint: { x: x + width / 2, y: y + height / 2 },
            toPortId: fullPortId
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
        onMouseUp={handleMouseUp}
    >
        {labelPosition === LABEL_POSITIONS.ABOVE && portLabel}
        <img id={fullPortId} height="30" width="30" ref={imgElem}
            onMouseEnter={() => changeOverPort(fullPortId)}
            onMouseLeave={() => changeOverPort(null)}
            onMouseDown={e => e.preventDefault()} src={require('./port.svg')} alt={fullPortId} />
        {labelPosition === LABEL_POSITIONS.BELOW && portLabel}
    </div>;
};

export default Port;