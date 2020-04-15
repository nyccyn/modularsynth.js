import React, { useState, useEffect, useCallback } from 'react';
import * as R from 'ramda';
import * as actions from '../actions';
import Port, { LABEL_POSITIONS } from '../../Common/Port';
import styles from './styles';
import { useModule, useConnections } from '../lib';
import { useAction } from '../../storeHelpers';

const Multiples = ({ id, audioContext }) => {
    const connections = useConnections(id);
    const registerInputs = useAction(actions.registerInputs);
    const registerOutputs = useAction(actions.registerOutputs);

    const [groupsInput, setGroupsInput] = useState({ A: null, B: null });

    const moduleFactory = useCallback(() => {
        const groupA = { input: null, audioNode: null };
        const groupB = { input: null, audioNode: null };
        return { groupA, groupB };
    }, [audioContext]);
    const module = useModule(id, moduleFactory);

    useEffect(() => {
        if (!module) return;

        const createGroupInputs = group => {
            const groupInputs = {};
            const moduleGroup = module[`group${group}`];
            for (let i = 1; i <= 4; i++) {
                groupInputs[`Group${group}${i}In`] = {
                    connect: audioNode => {
                        setGroupsInput({ ...groupsInput, [group]: i })
                        moduleGroup.input = i;
                        moduleGroup.audioNode = audioNode;
                    },
                    disconnect: () => {
                        setGroupsInput({ ...groupsInput, [group]: null })
                        moduleGroup.audioNode = null;
                    }
                };
            }
            return groupInputs;
        }

        const createGroupOutputs = group => {
            const groupOutpus = {};
            for (let i = 1; i <= 4; i++) {
                groupOutpus[`Group${group}${i}Out`] = () => module[`group${group}`].audioNode;
            }
            return groupOutpus;
        }

        registerInputs(id, {
            ...createGroupInputs('A'),
            ...createGroupInputs('B')
        });
        registerOutputs(id, {
            ...createGroupOutputs('A'),
            ...createGroupOutputs('B')
        });
    }, [module, id, registerInputs, registerOutputs]);

    const renderGroup = useCallback(group => {
        const result = [];
        for (let i = 1; i <= 4; i++) {
            const isInput = R.isNil(groupsInput[group]) || groupsInput[group] === i;
            const portProps = {
                key: `Group${group}${i}`,
                portId: `Group${group}${i}${isInput ? 'In' : 'Out'}`,
                connections,
                moduleId: id,
                portType: isInput ? 'input' : 'output',
                labelPosition: LABEL_POSITIONS.HIDE
            };
            result.push(<Port {...portProps} />)
        }
        return result;
    }, [groupsInput]);

    return <div style={styles.container}>
        <span style={{ fontSize: 13 }}>Multiples</span>
        <div style={styles.body}>
            <div>
                {renderGroup('A')}
            </div>
            <div>
                {renderGroup('B')}
            </div>
        </div>
    </div>;
}

Multiples.isBrowserSupported = typeof ConstantSourceNode !== 'undefined';
Multiples.panelWidth = 3;
export default Multiples;