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

export function useConnections(id) {
    return useSelector(R.path(['modules', 'connections', id]));    
}