import React, {Component} from 'react';

import './Loading.scss';

class Loading extends Component {
    render() {
        return (
            <div
                style={{top: this.props.loading ? 0 : "-100vh"}}
                className="loading_wrapper blurbackground"
            >
                <div className="loader" />
                <img src="/assets/Icon.png" alt="Icon" />
            </div>
        )
    }
}

export default Loading;