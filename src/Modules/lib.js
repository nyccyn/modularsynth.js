import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';

export function getFirstAudioParam(audioNode)
{
    for (let p in audioNode) {
        if (audioNode[p] instanceof AudioParam) {
            return audioNode[p];
        }
    }
    return null;
}

export function useListenToFirstAudioParam(audioNode, callback)
{
    const savedCallback = useRef(callback);
    const [intervalId, setIntervalId] = useState(null);

    useEffect(() => savedCallback.current = callback, [callback]);

    useEffect(() => {
        if (!audioNode) return;        
        const audioParam = getFirstAudioParam(audioNode);
        if (audioParam) {
            let lastValue = audioParam.value;
            savedCallback.current(lastValue);
            setIntervalId(setInterval(() => {                
                if (lastValue !== audioParam.value) {
                    lastValue = audioParam.value;
                    savedCallback.current(lastValue);
                }
            }, 0));
        }        
    }, [audioNode]);    
    return intervalId;
}

export function useConnections(id) {
    return useSelector(R.path(['modules', 'connections', id]));    
}