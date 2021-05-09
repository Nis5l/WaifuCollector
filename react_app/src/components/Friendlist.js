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
    const [friendRequests, setFriendRequests] = useState([]);
    const [width, setWidth] = useState(window.screen.availWidth);

    let lcounter = 0;
    let lcounterMax = 1;

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

            if (props.onFriendRequests) {
                const friendrqs = friends.filter((friend) => friend.status === 0);
                setFriendRequests(friendrqs);
                props.onFriendRequests(friendrqs.length);
            }

            setFriends(filteredFriends);

            incrementLCounter()

            if (props.onFriendData) props.onFriendData(friends);
        }

        fetchData();

    }, [props.userID]);

    const resizeMethod = () => {
        setWidth(window.screen.availWidth);
    }

    useEffect(() => {
        window.addEventListener('resize', resizeMethod);

        return () => window.removeEventListener('resize', resizeMethod);
    });

    function incrementLCounter() {
        lcounter++;
        if (lcounter === lcounterMax && props.lCallback) props.lCallback();
    }

    if (props.userID === undefined)
        return (<div className="friendslist"></div>);

    let inner = (
        <div className="friendRequests">
            <ul style={{transform: props.requests ? "translateY(-100%)" : "translateY(0)"}}>
                {friends.map((friend) => {

                    return (
                        <FriendComponent
                            key={friend.userID}
                            avatar="/assets/Icon.png"
                            userID={friend.userID}
                            status={friend.status}
                            username={friend.username}
                        />
                    )

                })}
                {friends.map((friend) => {

                    return (
                        <FriendComponent
                            key={friend.userID}
                            avatar="/assets/Icon.png"
                            userID={friend.userID}
                            status={friend.status}
                            username={friend.username}
                        />
                    )

                })}
                {friends.map((friend) => {

                    return (
                        <FriendComponent
                            key={friend.userID}
                            avatar="/assets/Icon.png"
                            userID={friend.userID}
                            status={friend.status}
                            username={friend.username}
                        />
                    )

                })}
            </ul>
            <ul style={{transform: props.requests ? "translateY(0)" : "translateY(-100%)"}}>
                {friendRequests.map((friend) => {

                    return (
                        <FriendComponent
                            key={friend.userID}
                            avatar="/assets/Icon.png"
                            userID={friend.userID}
                            status={friend.status}
                            username={friend.username}
                        />
                    )

                })}

            </ul>
        </div>
    )

    return (

        < div
            className="friendslist"
        >
            {
                width > 768 ?
                    <Scrollbar>
                        {inner}
                    </Scrollbar>
                    :
                    inner
            }

        </div >

    )
}

class Friend extends React.Component {

    constructor(props) {
        super(props);
        this.status = props.status;
    }

    onClick = (link) => {
        this.props.history.push(link);
    };

    render() {

        let options =
            [
                {
                    name: "Profile",
                    onClick: () => this.onClick("/profile/" + this.props.userID)
                }
            ];

        switch (this.status) {
            case 2:
                options.push(
                    {
                        name: "Trade",
                        onClick: () => this.onClick("/trade/" + this.props.userID)
                    }
                )
                break;
            default:
        }

        return (

            <li className="friend" >

                <img src={this.props.avatar} alt="Friend Avatar" />

                <ProfileName
                    userID={this.props.userID}
                    username={this.props.username}
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
