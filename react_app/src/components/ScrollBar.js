import React, {Component} from 'react'
import {Scrollbars} from 'react-custom-scrollbars'

import './ScrollBar.scss'

class Scrollbar extends Component {

    constructor(props, ...rest) {
        super(props, ...rest);
        this.renderThumb = this.renderThumb.bind(this);
    }

    renderThumb({style, ...props}) {
        const thumbStyle = {
            backgroundColor: `rgba(${140}, ${140}, ${140}, ${0.2})`,
            borderRadius: "15px"
        };
        return (
            <div
                style={{...style, ...thumbStyle}}
                {...props} />
        );
    }

    renderView(props) {
        return (
            <div {...props} className="scroll_view" />
        )
    }

    render() {
        return (
            <Scrollbars
                className="scrollbar"
                renderThumbHorizontal={this.renderThumb}
                renderThumbVertical={this.renderThumb}
                renderView={this.renderView}
                {...this.props} />
        );
    }
}

export default Scrollbar;
