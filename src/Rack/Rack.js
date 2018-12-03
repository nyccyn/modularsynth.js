import React, { Component } from 'react';
import { connect } from "react-redux";
import * as R from 'ramda';
import ModulePicker from './ModulePicker';

class Rack extends Component {
    constructor(props){
        super(props);
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this._audioContext = new AudioContext();
    }

    render() {
        const { modules } = this.props;
        return <div>
            <ModulePicker/>
            <div style={{ display: "flex" }}>
                { modules.map(({ Module, id }) => <Module id={id} key={id} audioContext={this._audioContext}/>) }
            </div>
        </div>;
    }
}

const mapStateToProps = state => ({
    modules: R.values(state.modules)
});
export default connect(mapStateToProps, {})(Rack);
