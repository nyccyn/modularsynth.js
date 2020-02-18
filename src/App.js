import React, { Component } from 'react';
import { Provider } from 'react-redux';
import store from './store';
import Synth from './Synth/Components/Synth';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import './App.css';

library.add(faTrash);

class App extends Component {
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
