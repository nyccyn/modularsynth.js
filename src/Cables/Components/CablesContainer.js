import React from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Cable from './Cable';

const CablesContainer = ({ cables, scrollLeft }) =>
    <svg style={{ position: 'absolute', left: -scrollLeft, top: 0, width: `calc(100% + ${scrollLeft}px)`, height: '100%', pointerEvents: 'none' }}>
        {cables.map(({ portId, fromPoint, toPoint, color }) => <Cable key={portId} fromPoint={fromPoint} toPoint={toPoint} color={color}/>)}
    </svg>;

const mapStateToProps = ({ cables }) => ({
    cables: R.values(cables.cables)
});

export default connect(mapStateToProps, {})(CablesContainer);