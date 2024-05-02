import React, { Component } from 'react';
import { Provider } from 'react-redux';
import store from './store';
import Synth from './Synth/Components/Synth';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faTrash, faArrowLeft, faPlusCircle, faFileUpload, faFileDownload } from '@fortawesome/free-solid-svg-icons'
import './App.css';

library.add(faTrash);
library.add(faArrowLeft);
library.add(faPlusCircle);
library.add(faFileUpload);
library.add(faFileDownload);


// await atx.audioWorklet.addModule("worklet/clock-processor.js");

class App extends Component { 
    constructor() {
        super();
        // this.actx = new (window.AudioContext || window.webkitAudioContext)();
        // this.loadModule();
    }

    // async loadModule() {
    //     const {  actx } = this;   
    //     try {
    //       await actx.audioWorklet.addModule(`worklet/clock-processor.js`);
          
          
    //     } catch(e) {
          
    //       console.log(`Failed to load module`, e);
    //     }
    //   }

    render()
    {
        return (
            <Provider store={store}>
                <div className="App">
                    <Synth/>
                </div>
            </Provider>
        );
    }
}

export default App;
