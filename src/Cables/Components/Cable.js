import React from 'react';

const calculateMidpoint = (fromPoint, toPoint) => {
    const lowestPoint = fromPoint.y > toPoint.y ? fromPoint : toPoint;
    const highestPoint = fromPoint.y < toPoint.y ? fromPoint : toPoint;
    const midpointY = Math.abs(fromPoint.y - toPoint.y) / 0.2;
    const distance = lowestPoint.x < highestPoint.x ? 0.3 : 0.7;
    const direction = fromPoint.x < toPoint.x ? 1 : -1;
    const midpointX = direction * distance * Math.abs(fromPoint.x - toPoint.x);
    return `${midpointX} ${midpointY}`;
};
//randomColor({ luminosity: 'dark' });
// export default class Cable extends Component {
//     constructor(props) {
//         super(props);
//         this._color =
//     }
//
//     render(){
//         const { fromPoint, toPoint, color } = this.props;
//         return <path d={`M${fromPoint.x} ${fromPoint.y} q ${calculateMidpoint(fromPoint, toPoint)} ${toPoint.x - fromPoint.x} ${toPoint.y - fromPoint.y}`}
//                      stroke={color} fill='transparent' strokeWidth={5}/>;
//     }
// }

const Cable = ({ fromPoint, toPoint, color }) =>
    <path
        d={`M${fromPoint.x} ${fromPoint.y} q ${calculateMidpoint(fromPoint, toPoint)} ${toPoint.x - fromPoint.x} ${toPoint.y - fromPoint.y}`}
        stroke={color} fill='transparent' strokeWidth={5}/>;
export default Cable;