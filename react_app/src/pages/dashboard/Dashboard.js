import Cookies from 'js-cookie'
import React, {Component, lazy, Suspense} from 'react'

import Card from '../../components/Card';
import redirectIfNecessary from '../../components/Redirecter'
import {withRouter} from 'react-router-dom'

import axios from 'axios'
import Config from '../../config.json'

import "./Dashboard.scss"

const Friendlist = lazy(() => import('../../components/Friendlist'));
const PackProgressRing = lazy(() => import('../../components/PackProgressRing'));
const ProfileName = lazy(() => import('../../components/ProfileName'));

const loading = () => <p>Loading...</p>

class Dashboard extends Component {

    constructor(props) {
        super(props);

        this.lcounter = 0;
        this.lcounterMax = 5;

        this.state =
        {
            userID: Cookies.get('userID'),
            friends: 0,
            maxFriends: 0,
            cards: 0,
            maxCards: 0,
            trades: 0,
            maxTrades: 0,
            loading: true
        }
    }

    componentDidMount() {

        async function loadStats(self, userID) {

            const data = await axios.get(`${Config.API_HOST}/user/${userID}/stats`);

            if (redirectIfNecessary(self.props.history, data)) return;

            if (data.data && data.data.status === 0) {

                delete data.data["status"];

                return data.data;

            }

            return [];
        }

        async function updateStats(self) {

            const stats = await loadStats(self, self.state.userID);

            self.incrementLCounter(self);

            self.setState(stats);
        }

        axios.get(`${Config.API_HOST}/verified?token=${Cookies.get('token')}`)
            .then((res) => {
                if (res.data && res.data.status === 0) {
                    switch (res.data.verified) {
                        case 1:
                            this.props.history.push('/verify');
                            break;

                        case 2:
                            this.props.history.push('/verify/mail');
                            break;

                        default:
                    }
                    return;
                }
            });

        updateStats(this);

    }

    friendPopup(self) {
        self.props.history.push("/users")
    }

    incrementLCounter(self) {
        self.lcounter++;
        console.log(self.lcounter + "/" + self.lcounterMax);
        if (self.lcounter === self.lcounterMax) self.setState({loading: false});
    }

    render() {

        return (

            <div className="container">
                {this.state.loading && <div className="blurbackground" />}

                <Card
                    title="Account Info"
                    styleClassName="accountInfo"
                >

                    <div className="avatar">

                        <img src="/assets/Icon.png" alt="Avatar" />

                    </div>

                    <div className="profilename_container">

                        <Suspense fallback={loading()}>
                            <ProfileName
                                userID={this.state.userID}
                                lCallback={() => {this.incrementLCounter(this)}}
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

                </Card>

                <Card
                    title="Badges"
                    styleClassName="badges"
                >
                    <h1>Badges</h1>
                </Card>

                <Card
                    title="Packs"
                    styleClassName="packs"
                >

                    <div className="packs-grid">

                        <Suspense fallback={loading()}>
                            <PackProgressRing
                                className="pack1"
                                lCallback={() => {this.incrementLCounter(this)}}
                            />
                        </Suspense>
                        <Suspense fallback={loading()}>
                            <PackProgressRing
                                className="pack2"
                                lCallback={() => {this.incrementLCounter(this)}}
                            />
                        </Suspense>

                    </div>

                </Card>

                <div className="friends_wrapper">
                    <Card
                        title="Friends"
                        styleClassName="friends"
                        icon="fa-users"
                        onIconClick={() => {this.friendPopup(this)}}
                    >
                        <Suspense fallback={loading()}>
                            <Friendlist
                                userID={this.state.userID}
                                lCallback={() => {this.incrementLCounter(this)}}
                            />
                        </Suspense>

                    </Card>
                </div>

            </div>

        )
    }
}

export default withRouter(Dashboard);
