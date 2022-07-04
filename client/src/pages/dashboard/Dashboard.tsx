import Cookies from 'js-cookie'
import React, {Component, lazy, Suspense} from 'react'

import Card from '../../components/Card';
import Badges from '../../components/Achievements';
import redirectIfNecessary from '../../components/Redirecter'
import Loading from '../../components/Loading'
import Logo from '../../components/Logo'
import {RouteComponentProps, withRouter} from 'react-router-dom'

import axios from 'axios'
import Config from '../../config.json'

import "./Dashboard.scss"
import Achievements from '../../components/Achievements';

const Friendlist = lazy(() => import('../../components/Friendlist'));
const PackProgressRing = lazy(() => import('../../components/PackProgressRing'));
const ProfileName = lazy(() => import('../../components/ProfileName'));

const loading = () => <p>Loading...</p>

type PropsDashboard = RouteComponentProps & {

}

type StateDashboard = {
    userID: string | undefined,
    friends: number,
    maxFriends: number,
    cards: number,
    maxCards: number,
    trades: number,
    maxTrades: number,
    loading: boolean,
    friendRequests: number,
    achievements: any[],
    requests: boolean
}

class Dashboard extends Component<PropsDashboard, StateDashboard> {
    private lcounter: number;
    private lcounterMax: number;

    constructor(props: PropsDashboard) {
        super(props);

        this.lcounter = 0;
        this.lcounterMax = 4;

        this.state =
        {
            userID: Cookies.get('userID'),
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

        async function loadStats(self: Dashboard, userID: number) {
			try {
				const response = await axios.get(`${Config.API_HOST}/user/${userID}/stats`);
				return response.data;
			} catch (err) {
				return [];
			}
        }

        async function updateStats(self: Dashboard) {
            if(self.state.userID == null) return;

            const stats = await loadStats(self, parseInt(self.state.userID));

            self.incrementLCounter(self);

            self.setState(stats);
        }

        const config =
        {
			headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
        }

        axios.get(`${Config.API_HOST}/verify/check`, config)
            .then(res => {
				switch (res.data.verified) {
					case 1:
						this.props.history.push('/verify');
						break;
					case 2:
						this.props.history.push('/verify/mail');
						break;
					default:
				}
            }).catch(err => {
				console.log("Unexpected /verify/check error");
			});;

        updateStats(this);

    }

    friendPopup(self: Dashboard) {
        self.props.history.push("/users")
    }

    incrementLCounter(self: Dashboard) {
        self.lcounter++;
        if (self.lcounter == self.lcounterMax) self.setState({loading: false});
    }

    render() {

        return (

            <div className="container">
                <Loading loading={this.state.loading} />

                <Card
                    title="Account Info"
                    styleClassName="accountInfo"
                    icon={''} iconNum={0}
                    onIconClick={function (): void {} }
                    onClick={function (event: any): void {} }
                    >

                    <div className="avatar">

                        <Logo className="logo" size="" />

                    </div>

                    <div className="profilename_container">

                        <Suspense fallback={loading()}>
                            <ProfileName
                                userID={this.state.userID != null ? parseInt(this.state.userID) : 0}
                                lCallback={() => { this.incrementLCounter(this); } } username={''} badges={undefined}                            />
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

                </Card>

                <Card
                    title="Achievements"
                    styleClassName="achievements"
                    icon={''}
                    iconNum={0}
                    onIconClick={function (): void {}}
                    onClick={function (event: any): void {} }
                    >
					<Achievements
						achievements={this.state.achievements}
					/>
                </Card>

                <Card
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
                                className="pack1"
                                lCallback={() => {this.incrementLCounter(this)}}
                            />
                        </Suspense>
                        {false && <Suspense fallback={loading()}>
                            <PackProgressRing
                                className="pack2"
                                lCallback={() => {this.incrementLCounter(this)}}
                            />
                        </Suspense>}

                    </div>

                </Card>

                <div className="friends_wrapper">
                    <Card
                        title="Friends"
                        styleClassName="friends"
                        icon={this.state.requests ? "fa-user-friends" : "fa-user"}
                        iconNum={this.state.requests ? 0 : this.state.friendRequests}
                        onIconClick={() => { this.setState({ requests: !this.state.requests }); } }
                        onClick={function (event: any): void {} }
                    >
                        <Suspense fallback={loading()}>
                            <Friendlist
                                userID={this.state.userID != null ? parseInt(this.state.userID) : 0}
                                lCallback={() => { this.incrementLCounter(this); } }
                                onFriendRequests={(count) => { this.setState({ friendRequests: count }); } }
                                requests={this.state.requests}
                                decrementRequests={() => { this.setState({ friendRequests: this.state.friendRequests - 1 }); } }
                                onFriendData={function (friends: any[]): void {} }
                            />
                        </Suspense>

                    </Card>
                </div>

            </div>

        )
    }
}

export default withRouter(Dashboard);
