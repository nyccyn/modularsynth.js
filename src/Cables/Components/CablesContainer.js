import React from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Cable from './Cable';

const CablesContainer = ({ cables }) =>
    <svg style={{ position: 'fixed', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {cables.map(({ portId, fromPoint, toPoint, color }) => <Cable key={portId} fromPoint={fromPoint} toPoint={toPoint} color={color}/>)}
    </svg>;

const mapStateToProps = ({ cables }) => ({
    cables: R.values(cables.cables)
});

export default connect(mapStateToProps, {})(CablesContainer);