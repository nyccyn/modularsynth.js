import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';

const IconButton = styled(FontAwesomeIcon)`
font-size: 25px;
margin-right: 20px;
color: #e8e8e8;
cursor: pointer;

&:hover {
    color: white;        
}
`;

export default IconButton;