import Cookies from 'js-cookie'
import React, {Component} from 'react'
import Card from '../../components/Card'
import Friendlist from '../../components/Friendlist'
import PackProgressRing from '../../components/PackProgressRing'
import ProfileName from '../../components/ProfileName'
import redirectIfNecessary from '../../components/Redirecter'
import {withRouter} from 'react-router-dom'

import axios from 'axios'
import Config from '../../config.json'

import "./Dashboard.scss"

class Dashboard extends Component {

    constructor(props) {
        super(props);

        this.state =
        {
            userID: Cookies.get('userID'),
            friends: 0,
            maxFriends: 0,
            cards: 0,
            maxCards: 0,
            trades: 0,
            maxTrades: 0
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

            self.setState(stats);
        }

        updateStats(this);

    }

    render() {

        return (

            <div className="container">

                <Card
                    title="Account Info"
                    styleClassName="accountInfo"
                >

                    <div className="avatar">

                        <img src="/assets/Icon.png" alt="Avatar" />

                    </div>

                    <div className="profilename_container">

                        <ProfileName
                            userID={this.state.userID}
                        />

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

                        <PackProgressRing className="pack1" />
                        <PackProgressRing className="pack2" />

                    </div>

                </Card>

                <Card
                    title="Friends"
                    styleClassName="friends"
                >

                    <Friendlist
                        userID={this.state.userID}
                    />

                </Card>

            </div>

        )
    }
}

export default withRouter(Dashboard);
