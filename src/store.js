import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducer from './reducer';
import middleware from './middleware';

const middlewareChain = [
    thunk,
    middleware
];

const enhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__(applyMiddleware(...middlewareChain)) :
    applyMiddleware(...middlewareChain);

export default createStore(reducer, enhancer);