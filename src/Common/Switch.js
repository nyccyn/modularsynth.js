import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as R from 'ramda';
import styled, { css } from 'styled-components';

const Container = styled.div`
    display: flex;
    flex-direction: ${({ vertical }) => vertical ? 'row': 'column' };
    align-items: center;
    justify-content: center;
`;

const LabelsContainer = styled.div`
    display: flex;
    flex-direction: ${({ vertical }) => vertical ? 'column': 'row' };
    justify-content: space-between;
    ${({ vertical, size }) =>
        vertical ?
        css`height: ${size + 10}px;` :
        css`width: ${size + 10}px;`
    }
`;

const Label = styled.span`
    font-size: 10px; 
    flex: 1;
`;

const HandlerContainer = styled.div`
    background-color: black;
    width: ${({ vertical, size }) => vertical ? 10 : size}px;
    height: ${({ vertical, size }) => vertical ? size : 10}px;
    cursor: pointer;
    position: relative;
`;

const Handler = styled.div`        
    width: ${({ vertical, handlerSize }) => vertical ? 10 : handlerSize}px;
    height: ${({ vertical, handlerSize }) => vertical ? handlerSize : 10}px;
    background-color: gray;
    position: absolute;
    transition: ${({ vertical }) => vertical ? 'top': 'left' } .2s;
    ${({ vertical, position }) =>
        vertical ?
        css`top: ${position}px;` :
        css`left: ${position}px;`
    }
`;

const Switch = ({ value, onChange, options, vertical = false, size = 30, handlerSize = 5 }) => {
    
    const [position, setPosition] = useState(0);
    const [isMoving, setIsMoving] = useState(false);

    const ref = useRef(null);    

    const ranges = useMemo(() => {
        const result = [handlerSize/2];
        for (let i = 1; i < options.length - 1; i++)
        {
            result.push(size / (options.length - 1) * i);
        }
        result.push(size - handlerSize / 2);
        return result;
    }, [options, size, handlerSize]);

    useEffect(() => {
        let newPos = R.findIndex(R.whereEq({ value }), options) * (size / (options.length - 1)) - handlerSize / 2;
        newPos = Math.min(Math.max(0, newPos), size - handlerSize);
        setPosition(newPos);
    }, [value, options, size, handlerSize]);

    const moveHandler = useCallback(e => {
        const pos = e[vertical ? 'clientY': 'clientX'] - ref.current.getBoundingClientRect()[vertical ? 'y' : 'x'];
        const newVal = R.findIndex(range => Math.abs(pos - range) <= handlerSize / 2, ranges);
        if (newVal !== -1)
        {
            onChange(options[newVal].value);
        }
    }, [ranges, handlerSize, onChange, options]);

    const handleSpaceMouseDown = useCallback(e => {
        e.stopPropagation();
        moveHandler(e);
    }, [moveHandler]);
    
    const handleHandlerMouseDown = useCallback((e) => {
        e.stopPropagation();
        setIsMoving(true);
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsMoving(false);
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!isMoving) return;

        e.stopPropagation();
        e.preventDefault();
        moveHandler(e);        
    }, [isMoving, moveHandler]);

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, [handleMouseUp, handleMouseMove]);
    
    return <Container vertical={vertical}>
        <LabelsContainer size={size} vertical={vertical}>
            { options.map(({ value, label }) => <Label key={value}>{label}</Label>) }
        </LabelsContainer>        
        <HandlerContainer size={size} vertical={vertical} onMouseDown={handleSpaceMouseDown} ref={ref}>
                <Handler position={position} vertical={vertical} handlerSize={handlerSize} onMouseDown={handleHandlerMouseDown}/>            
        </HandlerContainer>
    </Container>;
}

export default Switch;