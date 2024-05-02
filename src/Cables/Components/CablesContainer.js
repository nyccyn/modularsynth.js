import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Cable from './Cable';

const CablesContainer = ({ scrollLeft, height, scrollTop }) => {    
    const cablesState = useSelector(({ cables: { cables }}) => cables);
    const cables = useMemo(() => Object.values(cablesState), [cablesState]);
    const overPort = useSelector(({ cables: { overPort }}) => overPort);

    return <svg style={{ position: 'fixed', left: -scrollLeft, top: -scrollTop, width: `calc(100% + ${scrollLeft}px)`, height, pointerEvents: 'none' }}>
        {cables.map((cable) => <Cable key={cable.portId} {...cable} overPort={overPort}/>)}
    </svg>;;
}

export default CablesContainer;