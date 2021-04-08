import React, {Component} from 'react'
import Card from './Card'

import './Popup.scss'

class YesNo extends Component {
    constructor(props) {
        super(props);

        this.yesCallback = props.yesCallback;
        this.noCallback = props.noCallback;
    }

    yesClick = () => {
        if (this.yesCallback !== undefined) this.yesCallback();
    }

    noClick = () => {
        if (this.noCallback !== undefined) this.noCallback();
    }

    render() {
        return (
            <div className="popup_wrapper">
                <div className="blurbackground" />
                <Card styleClassName="popup">
                    <div className="popup_content">
                        <div className="text_area">
                            <p>Upgrade?</p>
                        </div>
                        <div className="input_area">
                            <input type="button" onClick={this.yesClick} className="button_input" value="Yes" />
                            <input type="button" onClick={this.noClick} className="button_input" value="No" />
                        </div>
                    </div>
                </Card>
            </div>
        )
    }
}

export {YesNo};
