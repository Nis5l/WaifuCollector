import {Component} from 'react'
import FitText from '@plutonium-js/react-fit-text'

import "./ResizeText.scss"

type PropsResizeText = {
    center: boolean,
    maxSize: number,
    children: any
}

class ResizeText extends Component<PropsResizeText> {

    render() {
        return (
            <div className="resizetext_wrapper">
                <FitText
                    className="resizetext"
                    style={{justifyContent: this.props.center === true ? "center" : "flex-start"}}
                    maxSize={this.props.maxSize}
                >
                    {this.props.children}
                </FitText>
            </div >
        );
    }
}

export default ResizeText;
