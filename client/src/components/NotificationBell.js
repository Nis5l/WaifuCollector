import React, {Component} from 'react'

import Cookies from 'js-cookie'
import axios from 'axios'

import Config from '../config.json'

import './NotificationBell.scss'

class NotificationBell extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="notification_bell">
                <i className="fas fa-bell">
                    {
                        this.props.notifications !== undefined &&
                        this.props.notifications !== 0 &&
                        <div className="circle">
                            <p className="unselectable">
                                {this.props.notifications}
                            </p>
                        </div>
                    }
                </i>
            </div >
        )
    }
}

export default NotificationBell;
