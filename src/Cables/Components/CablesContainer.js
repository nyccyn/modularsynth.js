import React from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import Cable from './Cable';

const CablesContainer = ({ scrollLeft, height, scrollTop }) => {
    const cables = useSelector(R.pipe(R.path(['cables', 'cables']), R.values));
    const overPort = useSelector(R.path(['cables', 'overPort']));

    return <svg style={{ position: 'fixed', left: -scrollLeft, top: -scrollTop, width: `calc(100% + ${scrollLeft}px)`, height, pointerEvents: 'none' }}>
        {cables.map((cable) => <Cable key={cable.portId} {...cable} overPort={overPort}/>)}
    </svg>;;
}

export default CablesContainer;