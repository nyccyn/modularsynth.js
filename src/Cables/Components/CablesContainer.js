import React from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import Cable from './Cable';

const CablesContainer = ({ scrollLeft, height, scrollTop }) => {
    const cables = useSelector(R.pipe(R.path(['cables', 'cables']), R.values));

    return <svg style={{ position: 'fixed', left: -scrollLeft, top: -scrollTop, width: `calc(100% + ${scrollLeft}px)`, height, pointerEvents: 'none' }}>
        {cables.map(({ portId, fromPoint, toPoint, color }) => <Cable key={portId} fromPoint={fromPoint} toPoint={toPoint} color={color} />)}
    </svg>;;
}

export default CablesContainer;