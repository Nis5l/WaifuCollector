import React, {Component} from 'react'
import {useHistory} from 'react-router-dom'
import Card from './Card'
import Scrollbar from './ScrollBar'

import axios from 'axios'
import Cookies from 'js-cookie'
import Config from '../config.json'

import DoneIcon from '@material-ui/icons/Done';
import {timeSince} from '../Utils'

import "./Notifications.scss"

function Notification(props) {

    const timesince = timeSince(props.date);
    const history = useHistory();

    const done = () => {
        if (props.onHide) props.onHide();
    }

    const remove = () => {
        if (props.onRemove) props.onRemove(props.id);
    }

    let classNames = "notification";

    if (!props.icon)
        classNames += " noIcon";

    return (

        <div
            className={classNames}
            onClick={() => {
                done();
                remove();
                history.push("/" + props.url);
            }}
        >

            {props.icon &&

                <div className="icon">
                    <img src={props.icon} alt="icon" />
                </div>

            }

            <div className="not_content">

                <h2>{props.message}</h2>
                <p>{timesince}</p>

            </div>

            <div className="doneButton">

                <DoneIcon onClick={
                    (e) => {
                        remove();
                        e.stopPropagation();
                    }}
                />

            </div>

        </div>

    );

}

export default class Notifications extends Component {

    constructor(props) {
        super(props);

        this.state =
        {
            notifications: []
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
                    res.data.data.reverse();
                    this.setState({notifications: res.data.data});
                    if (this.props.onNotifications) this.props.onNotifications(res.data.data);
                }
            })
    }

    remove(id) {
        const data =
        {
            token: Cookies.get('token'),
            notificationID: id
        }

        for (let i = 0; i < this.state.notifications.length; i++) {
            if (this.state.notifications[i].id === id) {
                this.state.notifications.splice(i, 1);
                break;
            }
        }


        if (this.props.onNotifications) this.props.onNotifications(this.state.notifications);
        this.setState({notifications: [...this.state.notifications]});

        axios.post(`${Config.API_HOST}/deleteNotification`, data);
    }

    render() {

        return (
            <Card
                title="Notifications"
                styleClassName="notifications_container"
                onClick={(e) => e.stopPropagation()}
                icon="fa-times"
                onIconClick={() => {if (this.props.onHide) this.props.onHide()}}
            >
                <Scrollbar>
                    {

                        this.state.notifications.map((notification) => (

                            <Notification
                                onHide={this.props.onHide}
                                key={`notification-${notification.id}`}
                                message={notification.title}
                                date={notification.time}
                                icon="/assets/IconColor.png"
                                url={notification.url}
                                id={notification.id}
                                onRemove={(id) => this.remove(id)}
                            />
                        ))
                    }
                </Scrollbar>

            </Card>
        )
    }
}
