import {Component, lazy, Suspense} from 'react'

import { CardComponent, LoadingComponent } from '../../shared/components';

import { AchievementsComponent, ProfileImageComponent } from '../../shared/components';
import { withAxiosPrivate } from '../../hooks/useAxiosPrivate';
import { withAuth } from '../../hooks/useAuth';
import { withRouter } from '../../hooks/withRouter';
import type { DashboardState, DashboardProps } from './types';

const FriendListComponent = lazy(() => import('../../shared/components/friend-list'));
const PackProgressRing = lazy(() => import('./pack-progress-ring'));
const ProfileNameComponent = lazy(() => import('../../shared/components/profile-name'));

import "./dashboard.component.scss"

const loading = () => <p>Loading...</p>

const collectorID: string = "xxxxxxxxxxxxx";

class DashboardComponent extends Component<DashboardProps, DashboardState> {
    private lcounter: number;
    private lcounterMax: number;

    public componentMounted: boolean = false;

    constructor(props: DashboardProps) {
        super(props);

        this.lcounter = 0;
        this.lcounterMax = 4;

        this.state =
        {
            userID: this.props.auth != null ? this.props.auth.id : "",
            friends: 0,
            maxFriends: 0,
            cards: 0,
            maxCards: 0,
            trades: 0,
            maxTrades: 0,
            loading: true,
            friendRequests: 0,
			achievements: [],
            requests: false
        }
    }

    componentDidMount() {
        this.componentMounted = true;
        async function loadStats(self: DashboardComponent, userID: string) {
			try {
				const response = await self.props.axios.get(`/user/${userID}/stats`);
				return response.data;
			} catch (err) {
				return [];
			}
        }

        async function updateStats(self: DashboardComponent) {
            if(self.state.userID == null) return;

            const stats = await loadStats(self, self.state.userID);
            if(!self.componentMounted) return;

            self.incrementLCounter(self);
            self.setState(stats);
        }

        this.props.axios.get(`/verify/check`)
            .then((res: any) => {
				switch (res.data.verified) {
					case 1:
						this.props.router.navigate('/verify');
						break;
					case 2:
						this.props.router.navigate('/verify/mail');
						break;
					default:
                        break;
				}
            }).catch((err: any) => {
				console.log("Unexpected /verify/check error");
			});;

        updateStats(this);

    }

    componentWillUnmount(){
        this.componentMounted = false;
    }

    friendPopup(self: DashboardComponent) {
        self.props.router.navigate("/users")
    }

    incrementLCounter(self: DashboardComponent) {
        self.lcounter++;
        if (self.lcounter === self.lcounterMax) self.setState({loading: false});
    }

    render() {

        return (

            <div className="container">
                <LoadingComponent loading={this.state.loading} />

                <CardComponent
                    title="Account Info"
                    styleClassName="accountInfo"
                    >

                    <div className="avatar">

                        { /*<Logo className="logo" size="" />*/ }
                        <ProfileImageComponent userID={this.props.auth.id}></ProfileImageComponent>

                    </div>

                    <div className="profilename_container">

                        <Suspense fallback={loading()}>
                            <ProfileNameComponent
                                userID={this.state.userID != null ? this.state.userID : ""}
                                lCallback={() => { this.incrementLCounter(this); } }
                            />
                        </Suspense>

                    </div>

                    <table className="stats">

                        <tbody>

                            <tr>

                                <td>Friends:</td>
                                <td>{`${this.state.friends}/${this.state.maxFriends}`}</td>

                            </tr>

                            <tr>

                                <td>Waifus:</td>
                                <td>{`${this.state.cards}/${this.state.maxCards}`}</td>

                            </tr>

                            <tr>

                                <td>Trades:</td>
                                <td>{`${this.state.trades}/${this.state.maxTrades}`}</td>

                            </tr>

                        </tbody>

                    </table>

                </CardComponent>

                <CardComponent
                    title="Achievements"
                    styleClassName="achievements"
                    icon={''}
                    iconNum={0}
                    onIconClick={function (): void {}}
                    onClick={function (event: any): void {} }
                    >
					<AchievementsComponent
						achievements={this.state.achievements}
					/>
                </CardComponent>

                <CardComponent
                    title="Packs"
                    styleClassName="packs"
                    icon={''}
                    iconNum={0}
                    onIconClick={function (): void {} }
                    onClick={function (event: any): void {} }
                    >
                    <div className="packs-grid">

                        <Suspense fallback={loading()}>
                            <PackProgressRing
                                collectorID={collectorID}
                                className="pack1"
                                lCallback={() => {this.incrementLCounter(this)}}
                            />
                        </Suspense>
                        {false && <Suspense fallback={loading()}>
                            <PackProgressRing
                                collectorID={collectorID}
                                className="pack2"
                                lCallback={() => {this.incrementLCounter(this)}}
                            />
                        </Suspense>}

                    </div>

                </CardComponent>

                <div className="friends_wrapper">
                    <CardComponent
                        title="Friends"
                        styleClassName="friends"
                        icon={this.state.requests ? "fa-user-friends" : "fa-user"}
                        iconNum={this.state.requests ? 0 : this.state.friendRequests}
                        onIconClick={() => { this.setState({ requests: !this.state.requests }); } }
                    >
                        <Suspense fallback={loading()}>
                            <FriendListComponent
                                userID={this.state.userID != null ? this.state.userID : ""}
                                lCallback={() => { this.incrementLCounter(this); } }
                                onFriendRequests={(count: number) => { if(this.componentMounted) { this.setState({ friendRequests: count }); } } }
                                requests={this.state.requests}
                                decrementRequests={() => { if(this.componentMounted) { this.setState({ friendRequests: this.state.friendRequests - 1 }); } } }
                            />
                        </Suspense>

                    </CardComponent>
                </div>

            </div>

        )
    }
}

export default withAuth(withAxiosPrivate(withRouter(DashboardComponent)));
