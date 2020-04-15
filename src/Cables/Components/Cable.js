import React from 'react';

const calculateMidpoint = (fromPoint, toPoint) => {
    const lowestPoint = fromPoint.y > toPoint.y ? fromPoint : toPoint;
    const highestPoint = fromPoint.y < toPoint.y ? fromPoint : toPoint;
    const midpointY = 0.1 * Math.abs(toPoint.x - fromPoint.x) + Math.abs(fromPoint.y - toPoint.y) / 0.4;
    let distance = 0.5 + Math.log(1 + Math.abs((toPoint.y - fromPoint.y) / (toPoint.x - fromPoint.x))) / (3 * Math.log(2));
    distance = lowestPoint.x < highestPoint.x ? 1 - distance : distance;
    const direction = fromPoint.x < toPoint.x ? 1 : -1;
    const midpointX = direction * distance * Math.abs(fromPoint.x - toPoint.x) || fromPoint.x;
    return `${midpointX} ${midpointY}`;
};

const Cable = ({ fromPoint, toPoint, color, overPort, portId, toPortId }) =>
    <path
        d={`M${fromPoint.x} ${fromPoint.y} q ${calculateMidpoint(fromPoint, toPoint)} ${toPoint.x - fromPoint.x} ${toPoint.y - fromPoint.y}`}
        opacity={(overPort === portId || overPort === toPortId) ? 0.9 : 0.6} stroke={color} fill='transparent' strokeWidth={6}/>;
export default Cable;