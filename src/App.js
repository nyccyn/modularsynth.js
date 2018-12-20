import React, { Component } from 'react';
import { Provider } from 'react-redux';
import store from './store';
import Rack from './Rack/Components/Rack';
import './App.css';

class App extends Component {
    render()
    {
        return (
            <Provider store={store}>
                <div className="App">
                    <Rack/>
                </div>
            </Provider>
        );
    }
}

export default App;
