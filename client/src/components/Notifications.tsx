import React, {Component, useState} from 'react'
import Card from './Card'
import Scrollbar from './ScrollBar'
import redirectIfNecessary from './Redirecter'

import DoneIcon from '@material-ui/icons/Done';
import {timeSince} from '../Utils'

import "./Notifications.scss"
import { AxiosPrivateProps, withAxiosPrivate } from '../hooks/useAxiosPrivate'
import { useNavigate } from 'react-router-dom';
import { ReactRouterProps, withRouter } from '../hooks/withRouter';

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
    const navigate = useNavigate();

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
                navigate("/" + props.url);
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

type PropsNotifications = ReactRouterProps & AxiosPrivateProps & {
    onNotifications: (notifications: any) => void,
    onHide: () => void
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
        this.props.axios.get(`/notifications`)
            .then((res: any) => {
				res.data.notifications.reverse();
				this.setState({notifications: res.data.notifications});
				if (this.props.onNotifications) this.props.onNotifications(res.data.notifications);
            }).catch((err: any) => {
				if(err.request.status !== 401) {
					console.log("Unexpected /notifications error");
				}
			});
    }

    remove(id: number) {
        for (let i = 0; i < this.state.notifications.length; i++) {
            if (this.state.notifications[i].id === id) {
                this.state.notifications.splice(i, 1);
                break;
            }
        }


        if (this.props.onNotifications) this.props.onNotifications(this.state.notifications);
        this.setState({notifications: [...this.state.notifications]});

        this.props.axios.post(`/notifications/delete/${id}`, {}).catch((err: any) => {
			redirectIfNecessary(this.props.router.navigate, err);
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

export default withAxiosPrivate(withRouter(Notifications));
