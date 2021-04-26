import React, {Component} from 'react'

import './RefreshButton.scss'

class RefreshButton extends Component {
    constructor(props) {
        super(props);
        this.onRefresh = props.onRefresh;
    }

    onRefresh = () => {
        if (this.onRefresh !== undefined) this.onRefresh();
    }

    render() {
        return (
            <i onClick={this.onRefresh} className="fa fa-lg fa-refresh refresh_button" aria-hidden="true"></i>
        )
    }
}

export default RefreshButton;
