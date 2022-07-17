import React, {Component, useState} from 'react'
import Card from './Card'
import { ScrollbarComponent } from '../shared/components/scrollbar'
import redirectIfNecessary from './Redirecter'

import DoneIcon from '@material-ui/icons/Done';
import {timeSince} from '../Utils'

import "./Notifications.scss"
import { AxiosPrivateProps, withAxiosPrivate } from '../hooks/useAxiosPrivate'
import { useNavigate } from 'react-router-dom';
import { ReactRouterProps, withRouter } from '../hooks/withRouter';


type PropsNotifications = ReactRouterProps & AxiosPrivateProps & {
    onNotifications: (notifications: any) => void,
    onHide: () => void
}

type StateNotifications = {
    notifications: any[]
}

export class NotificationsComponent extends Component<PropsNotifications, StateNotifications>{

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
                <ScrollbarComponent>
                    {

                        this.state.notifications.map((notification) => (

                            <NotificationComponent
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
                </ScrollbarComponent>

            </Card>
        )
    }
}

export default withAxiosPrivate(withRouter(Notifications));
