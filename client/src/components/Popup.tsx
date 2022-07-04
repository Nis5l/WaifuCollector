import React, {Component} from 'react'
import Card from './Card'

import './Popup.scss'

type PropsYesNo = {
    text: string,
    yesCallback: () => void,
    noCallback: () => void
}

class YesNo extends Component<PropsYesNo> {
    private text: string;

    private yesCallback: () => void;
    private noCallback: () => void;

    constructor(props: PropsYesNo) {
        super(props);

        this.yesCallback = props.yesCallback;
        this.noCallback = props.noCallback;
        this.text = props.text;
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
                <Card 
                    styleClassName="popup"
                    title="" icon=""
                    iconNum={0}
                    onIconClick={function (): void {} } 
                    onClick={function (event: any): void {}}>
                    <div className="popup_content">
                        <div className="text_area">
                            <p>{this.text}</p>
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

type PropsYesNoCancel = PropsYesNo & {
    disableYes: boolean,
    cancelCallback: () => void
}

class YesNoCancel extends Component<PropsYesNoCancel> {
    private text: string;
    private disableYes: boolean | undefined;

    private yesCallback: () => void;
    private noCallback: () => void;
    private cancelCallback: () => void;

    constructor(props: PropsYesNoCancel) {
        super(props);

        this.yesCallback = props.yesCallback;
        this.noCallback = props.noCallback;
        this.cancelCallback = props.cancelCallback;
        this.text = props.text;
        this.disableYes = props.disableYes === true ? true : undefined;
    }

    yesClick = () => {
        if (this.yesCallback !== undefined) this.yesCallback();
    }

    noClick = () => {
        if (this.noCallback !== undefined) this.noCallback();
    }

    cancelClick = () => {
        if (this.cancelCallback) this.cancelCallback();
    }

    render() {
        return (
            <div className="popup_wrapper">
                <div className="blurbackground" />
                <Card styleClassName="popup"
                    title="" icon=""
                    iconNum={0}
                    onIconClick={function (): void {} } 
                    onClick={function (event: any): void {}}>
                    <div className="popup_content">
                        <div className="text_area">
                            <p>{this.text}</p>
                        </div>
                        <div className="input_area">
                            <input type="button" onClick={this.yesClick} className="button_input" value="Yes" disabled={this.disableYes} />
                            <input type="button" onClick={this.noClick} className="button_input" value="No" />
                        </div>
                        <div className="input_area cancel_wrapper">
                            <input type="button" onClick={this.cancelClick} className="button_input cancel" value="Cancel" />
                        </div>
                    </div>
                </Card>
            </div>
        )
    }
}

export {YesNo, YesNoCancel};
