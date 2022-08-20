import {Component} from 'react';

import type { LogoProps } from './types';
import './logo.component.scss'

class LogoComponent extends Component<LogoProps> {
    render() {
        return (
            <div style={{width: this.props.size, height: this.props.size}} className={"logo_wrapper " + this.props.className}>
                <img src="/assets/Icon.png" alt="Profile" />
            </div>
        );
    }
}

export default LogoComponent;
