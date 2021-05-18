import React, {Component} from 'react'

import Cookies from 'js-cookie'
import axios from 'axios'

import Config from '../config.json'

import './NotificationBell.scss'

class NotificationBell extends Component {

    constructor(props) {
        super(props);

        this.state =
        {
            notifications: undefined
        }
    }

    componentDidMount() {
        const data =
        {
            token: Cookies.get('token')
        }
        axios.post(`${Config.API_HOST}/notifications`, data)
            .then((res) => {
                if (res.data && res.data.status === 0) {
                    this.setState({notifications: res.data.data});
                }
            })
    }

    render() {
        return (
            <div className="notification_bell">
                <i className="fas fa-bell">
                    {
                        this.state.notifications !== undefined &&
                        this.state.notifications.length !== 0 &&
                        <div className="circle">
                            <p className="unselectable">
                                {this.state.notifications.length}
                            </p>
                        </div>
                    }
                </i>
            </div >
        )
    }
}

export default NotificationBell;
