import React, {useState, useEffect} from 'react'

import axios from 'axios'
import Config from '../config.json'

import './Friendlist.scss'
import ProfileName from './ProfileName'

import {withRouter} from 'react-router-dom';

import ThreeDotsMenu from './ThreeDotsMenu.js'

import Scrollbar from './ScrollBar'

function Friendlist(props) {

    const [friends, setFriends] = useState([]);

    useEffect(() => {

        async function loadFriends() {

            const data = await axios.post(Config.API_HOST + "/friends", {id: props.userID});

            if (data.data.status !== 0)
                return [];

            return data.data.friends;

        }

        async function fetchData() {

            let friends = await loadFriends();

            const filteredFriends = friends.filter((friend) => friend.status === 2);

            setFriends(filteredFriends);

        }

        fetchData();

    }, [props.userID]);

    if (props.userID === undefined)
        return (<div className="friendslist"></div>);

    return (

        <div
            className="friendslist"
        >
            <ul>
                <Scrollbar>

                    {friends.map((friend) => {

                        return (
                            <FriendComponent
                                key={friend.userID}
                                avatar="/assets/Icon.png"
                                userID={friend.userID}
                            />
                        )

                    })}

                </Scrollbar>
            </ul>

        </div>

    )
}

class Friend extends React.Component {

    onClick = (link) => {

        this.props.history.push(link);

    };

    render() {

        const options = [

            {

                name: "Profile",
                onClick: () => this.onClick("/profile/" + this.props.userID)

            },
            {

                name: "Trade",
                onClick: () => this.onClick("/trade/" + this.props.userID)

            }

        ];

        return (

            <li className="friend">

                <img src={this.props.avatar} alt="Friend Avatar" />

                <ProfileName
                    userID={this.props.userID}
                />

                <ThreeDotsMenu

                    menuID={("friendMenu-" + this.props.userID)}
                    options={options}

                />

            </li>

        )

    }

}

const FriendComponent = withRouter(Friend);

export default withRouter(Friendlist)
export {FriendComponent};
