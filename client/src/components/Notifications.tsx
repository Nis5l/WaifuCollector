import React, {Component, useState} from 'react'
import {useHistory, withRouter, Redirect, RouteComponentProps} from 'react-router-dom'
import Card from './Card'
import Scrollbar from './ScrollBar'
import redirectIfNecessary from './Redirecter'

import axios from 'axios'
import Cookies from 'js-cookie'
import Config from '../config.json'

import DoneIcon from '@material-ui/icons/Done';
import {timeSince} from '../Utils'

import "./Notifications.scss"

type PropsNotification = {
    id: number,
    icon: string,
    message: string,
    date: Date,
    url: string,
    onHide: () => void,
    onRemove: (id: number) => void
};

function Notification(props: PropsNotification) {

    const fadingTime = 0.2;
    const [fading, setFading] = useState(false);
    const timesince = timeSince(props.date);
    const history = useHistory();

    const done = () => {
        if (props.onHide) props.onHide();
    }

    const remove = () => {
        setFading(true);
        setTimeout(() => {
            if (props.onRemove) props.onRemove(props.id);
        }, fadingTime * 1000);
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
            style={{animation: fading ? `fadeout ${fadingTime}s forwards` : "none"}}
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

type PropsNotifications = RouteComponentProps & {
    onNotifications: (notifications: any) => void,
    onHide: () => void,
    history: any
}

type StateNotifications = {
    notifications: any[]
}

class Notifications extends Component<PropsNotifications, StateNotifications>{

    constructor(props: PropsNotifications) {
        super(props);

        this.state =
        {
            notifications: []
        }
    }

    componentDidMount() {
        const config =
        {
			headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
        }

        axios.get(`${Config.API_HOST}/notifications`, config)
            .then((res) => {
				res.data.notifications.reverse();
				this.setState({notifications: res.data.notifications});
				if (this.props.onNotifications) this.props.onNotifications(res.data.notifications);
            }).catch(err => {
				if(err.request.status != 401) {
					console.log("Unexpected /notifications error");
				}
			});
    }

    remove(id: number) {
        const config =
        {
			headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
        }

        for (let i = 0; i < this.state.notifications.length; i++) {
            if (this.state.notifications[i].id === id) {
                this.state.notifications.splice(i, 1);
                break;
            }
        }


        if (this.props.onNotifications) this.props.onNotifications(this.state.notifications);
        this.setState({notifications: [...this.state.notifications]});

        axios.post(`${Config.API_HOST}/notifications/delete/${id}`, {}, config).catch(err => {
			redirectIfNecessary(this.props.history, err);
		});
    }

    render() {

        return (
            <Card
                title="Notifications"
                styleClassName="notifications_container"
                onClick={(e) => e.stopPropagation()}
                icon="fa-times"
                onIconClick={() => {
                    if (this.props.onHide)
                        this.props.onHide()
                } }
                iconNum={0}
                >
                <Scrollbar>
                    {

                        this.state.notifications.map((notification) => (

                            <Notification
                                onHide={this.props.onHide}
                                key={`notification-${notification.id}`}
                                message={notification.title}
                                date={notification.time}
                                icon="/assets/Icon.png"
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

export default withRouter(Notifications);