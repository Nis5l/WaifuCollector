import React, {Component} from 'react'
import FitText from '@plutonium-js/react-fit-text'

import "./ResizeText.scss"

class ResizeText extends Component {
    constructor(props) {
        super();
        this.props = props;
        this.center = props.center === true ? true : false;
        this.maxSize = this.props.maxSize;
    }

    render() {
        return (
            <div className="resizetext_wrapper">
                <FitText
                    className="resizetext"
                    style={{justifyContent: this.center ? "center" : "flex-start"}}
                    maxSize={this.maxSize}
                >
                    {this.props.children}
                </FitText>
            </div >
        );
    }
}

export default ResizeText;
