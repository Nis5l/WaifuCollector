import React, {Component} from 'react'
import FitText from '@plutonium-js/react-fit-text'

import "./ResizeText.scss"

class ResizeText extends Component {
    constructor(props) {
        super();
        this.props = props;
    }

    render() {
        return (
            <div className="resizetext_wrapper">
                <FitText className="resizetext">
                    {this.props.children}
                </ FitText>
            </div>
        );
    }
}

export default ResizeText;
