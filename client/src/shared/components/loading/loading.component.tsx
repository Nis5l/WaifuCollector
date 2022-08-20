import {Component} from 'react';

import { LoadingProps } from './types';
import './loading.component.scss';

class LoadingComponent extends Component<LoadingProps> {
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

export default LoadingComponent;
