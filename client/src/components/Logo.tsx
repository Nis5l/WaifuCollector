import {Component} from 'react';

import './Logo.scss'

type Props = {
    className?: string,
    size?: string
}

class Logo extends Component<Props> {
    render() {
        return (
            <div style={{width: this.props.size, height: this.props.size}} className={"logo_wrapper " + this.props.className}>
                <img src="/assets/Icon.png" alt="Profile" />
            </div>
        );
    }
}

export default Logo;