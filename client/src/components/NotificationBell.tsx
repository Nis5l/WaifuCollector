import {Component} from 'react'

import './NotificationBell.scss'

type Props = {
    notifications: number
}

class NotificationBell extends Component<Props> {

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
