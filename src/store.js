import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducer from './reducer';
import middleware from './middleware';

const middlewareChain = [
    thunk,
    middleware
];

export default createStore(reducer, applyMiddleware(...middlewareChain));