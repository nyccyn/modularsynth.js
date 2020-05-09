import styled from 'styled-components';
import { prop } from 'ramda';

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%
`;

export const Body = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: space-evenly;
`;

export const SpaceAround = styled.div`
    display: flex;
    justify-content: space-around;
`;

export const Grid = styled.div`
    display: grid;
    flex: 1;
    grid-template-rows: ${prop('gridTemplateRows')};
    margin-top: ${prop('marginTop')}px;
    margin-bottom: ${prop('marginBottom')}px;
    margin-left: ${prop('marginLeft')}px;
    margin-right: ${prop('marginRight')}px;
`;

export const GridCell = styled.div`
    grid-column: ${prop('column')};
    grid-row: ${prop('row')};
`;

export default {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    },
    body: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'space-evenly'
    },
    spaceAround: {
        display: 'flex',
        justifyContent: 'space-around'
    }
};