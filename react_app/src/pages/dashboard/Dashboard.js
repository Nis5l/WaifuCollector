import Cookies from 'js-cookie'
import React, {useState, useEffect} from 'react'
import Card from '../../components/Card'
import Friendlist from '../../components/Friendlist'
import PackProgressRing from '../../components/PackProgressRing'
import ProfileName from '../../components/ProfileName'

import axios from 'axios'
import Config from '../../config.json'

import "./Dashboard.scss"

function Dashboard() {

    const [userID, setUserID] = useState(Cookies.get('userID'));
    const [stats, setStats] = useState({friends: 0, maxFriends: 0, cards: 0, maxCards: 0, trades: 0, maxTrades: 0});

    useEffect(() => {

        async function loadStats(userID) {

            const data = await axios.get(`${Config.API_HOST}/user/${userID}/stats`);

            //redirectIfNecessary(data);

            if (data.data && data.data.status === 0) {

                delete data.data["status"];

                return data.data;

            }

            return [];

        }

        async function updateStats() {

            const stats = await loadStats(userID);

            setStats(stats);

        }

        updateStats();

    }, [setStats, userID]);

    useEffect(() => {

        if (userID === undefined)
            setUserID(Cookies.get('userID'));

    }, [setUserID, userID]);

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
                        userID={userID}
                    />

                </div>

                <table className="stats">

                    <tbody>

                        <tr>

                            <td>Friends:</td>
                            <td>{`${stats.friends}/${stats.maxFriends}`}</td>

                        </tr>

                        <tr>

                            <td>Waifus:</td>
                            <td>{`${stats.cards}/${stats.maxCards}`}</td>

                        </tr>

                        <tr>

                            <td>Trades:</td>
                            <td>{`${stats.trades}/${stats.maxTrades}`}</td>

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
                    userID={userID}
                />

            </Card>

        </div>

    )
}

export default Dashboard
