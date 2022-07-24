import {Component} from 'react'
import { CardComponent } from '../../shared/components'
import { ScrollbarComponent } from '../../shared/components/scrollbar'
import redirectIfNecessary from '../Redirecter'

import "./notifications.component.scss"
import { withAxiosPrivate } from '../../hooks/useAxiosPrivate'
import { withRouter } from '../../hooks/withRouter';
import { NotificationComponent } from './notification';

import { NotificationsProps, NotificationsState } from './types';

export class NotificationsComponent extends Component<NotificationsProps, NotificationsState>{

    constructor(props: NotificationsProps) {
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

    remove(id: string) {
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
            <CardComponent
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
								notification={notification}
                                icon="/assets/Icon.png"
                                onRemove={(id) => this.remove(id)}
                            />
                        ))
                    }
                </ScrollbarComponent>

            </CardComponent>
        )
    }
}

export default withAxiosPrivate(withRouter(NotificationsComponent));
