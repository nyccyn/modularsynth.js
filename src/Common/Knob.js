import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import LABEL_POSITIONS from './LabelPositions';

const MAX_ANGLE = 150;

const Knob = ({ onChange, max, min, value, step, label, labelStyle = {}, labelPosition = LABEL_POSITIONS.ABOVE, height = 50, width = 50 }) => {
    const [isMoving, setIsMoving] = useState(false);
    const imgRef = useRef(null);
    const labelComp = useMemo(() => <span style={labelStyle}>{label}</span>, [label, labelStyle]);

    const handleMouseMove = useCallback((e) => {
        if (!isMoving) return;

        e.stopPropagation();
        e.preventDefault();
        if (e.buttons !== 1) return;

        const { x, y, width, height } = imgRef.current.getBoundingClientRect();
        const middle = { x: x + width / 2, y: y + height / 2 };

        const deltaX = e.clientX - middle.x;
        const deltaY = e.clientY - middle.y;
        let angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        if (angle < 0) angle += 360;
        angle -= 120;
        if (angle < 0) angle += 360;
        if (angle > 2.1 * MAX_ANGLE) angle = 0;

        const ratio = angle / (2 * MAX_ANGLE);
        let newValue = ratio * (max - min) + min;
        newValue = Math.floor(newValue / step) * step;
        if (newValue > max) newValue = max;
        onChange(newValue);
    }, [isMoving, min, max, onChange, step]);

    const handleMouseDown = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsMoving(true);
    }, []);

    const handleMouseUp = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsMoving(false);
    }, []);

    const calculateValueAngle = useCallback(() => {
        const totalDistance = max - min;
        const distanceFromMin = value - min;
        const ratio = distanceFromMin / totalDistance;
        return ratio * 2 * MAX_ANGLE;
    }, [min, max, value]);

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, [handleMouseUp, handleMouseMove]);

    return <div style={{
        display: 'flex',
        flexDirection: labelPosition === LABEL_POSITIONS.RIGHT || labelPosition === LABEL_POSITIONS.LEFT ? 'row' : 'column'
    }}
    >
        {(labelPosition === LABEL_POSITIONS.ABOVE || labelPosition === LABEL_POSITIONS.LEFT) && labelComp}
        <img ref={imgRef}
            style={{ cursor: 'pointer', margin: 'auto', transform: `rotate(${calculateValueAngle()}deg)` }}
            onMouseDown={handleMouseDown}
            alt='knob' src={require('./knob.svg').default} height={height} width={width} />
        {(labelPosition === LABEL_POSITIONS.BELOW || labelPosition === LABEL_POSITIONS.RIGHT) && labelComp}
    </div>;
};

export default Knob;