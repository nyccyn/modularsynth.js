import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';

const modules = {};

export function useModule(id, moduleFactory)
{        
    const [module, setModule] = useState(null);    
    useEffect(() => {
        console.debug(`useModule rendered for ${id}`);
        const memoizedModule = modules[id];        
        if (!R.isNil(memoizedModule)) {
            setModule(memoizedModule);
        }
        else {
            const newModule = moduleFactory();
            newModule.id = id;
            modules[id] = newModule;
            setModule(newModule);
        }
    }, [id, moduleFactory]);
    
    return module;
}

export function useListenToFirstAudioParam(audioNode, callback)
{
    const savedCallback = useRef(callback);
    const [intervalId, setIntervalId] = useState(null);

    useEffect(() => savedCallback.current = callback, [callback]);

    useEffect(() => {
        if (!audioNode) return;

        for (let p in audioNode) {
            if (audioNode[p] instanceof AudioParam) {
                let lastValue = audioNode[p].value;
                savedCallback.current(lastValue);
                setIntervalId(setInterval(() => {
                    if (lastValue !== audioNode[p].value) {
                        lastValue = audioNode[p].value;
                        savedCallback.current(lastValue);
                    }
                }, 0));
                break;
            }
        }
    }, [audioNode]);    
    return intervalId;
}

export function useConnections(id) {
    return useSelector(R.path(['modules', 'connections', id]));    
}