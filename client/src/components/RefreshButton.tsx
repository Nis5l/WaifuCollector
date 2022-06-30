import {Component} from 'react'

import './RefreshButton.scss'

type PropsRefresh = {
    onRefresh: () => void
}

class RefreshButton extends Component<PropsRefresh> {

    onRefresh = () => {
        if (this.props.onRefresh !== undefined) this.props.onRefresh();
    }

    render() {
        return (
            <i onClick={this.onRefresh} className="fa fa-lg fa-refresh refresh_button" aria-hidden="true"></i>
        )
    }
}

export default RefreshButton;
