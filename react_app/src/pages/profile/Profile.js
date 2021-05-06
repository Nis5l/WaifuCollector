import React, {useState, useEffect} from 'react'
import Card from '../../components/Card'
import Friendlist from '../../components/Friendlist'
import ProfileName from '../../components/ProfileName'

import Cookies from 'js-cookie';

import axios from 'axios'
import Config from '../../config.json'

import "./Profile.scss"

function Profile(props) {

    const userID = props.match.params.id;
    const [stats, setStats] = useState({friends: 0, maxFriends: 0, cards: 0, maxCards: 0, trades: 0, maxTrades: 0});
    const [friendStatus, setFriendStatus] = useState(-1);

    useEffect(() => {

        async function loadStats(userID) {

            const data = await axios.get(`${Config.API_HOST}/user/${userID}/stats`);

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

    if (!Number.isInteger(parseInt(userID, 10))) {

        return (
            <h1>Invalid this id is!</h1>
        );

    }

    function onFriendData(data) {
        const ownID = Cookies.get('userID');

        if (!ownID || ownID === userID) return;

        let status = -1;

        for (let i = 0; i < data.length; i++) {
            if (data[i].userID == ownID) {
                status = data[i].status;
                console.log(status);
                break;
            }
        }

        setFriendStatus(status);
    }

    function onFriendAdd() {
        const data = {
            token: Cookies.get('token'),
            userID: userID
        };
        axios.post(`${Config.API_HOST}/addfriend`, data);
        setFriendStatus(0);
    }

    let icon = "";
    if (friendStatus === -1) icon = "fa-user-plus";

    return (
        <div className="container_profile">

            <Card
                title="Account Info"
                styleClassName="accountInfo"
                icon={icon}
                onIconClick={onFriendAdd}
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
                title="Flex flex"
                styleClassName="flexen"
            >

                <div className="flex-grid">



                </div>

            </Card>

            <Card
                title="Friends"
                styleClassName="friends"
            >

                <Friendlist
                    userID={userID}
                    onFriendData={onFriendData}
                />

            </Card>

        </div>

    )
}

export default Profile
