import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import * as R from 'ramda';

export function useAction(action) {
    const dispatch = useDispatch();
    return useCallback(R.pipe(action, dispatch), [action, dispatch]);
}