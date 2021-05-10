import React, {useState, useEffect} from 'react'

import {YesNo} from './Popup'

import axios from 'axios'
import Config from '../config.json'
import Cookies from 'js-cookie'

import './Friendlist.scss'
import ProfileName from './ProfileName'

import {withRouter} from 'react-router-dom';

import ThreeDotsMenu from './ThreeDotsMenu.js'

import Scrollbar from './ScrollBar'

function Friendlist(props) {

    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [width, setWidth] = useState(window.screen.availWidth);
    const [deleteUser, setDeleteUser] = useState(undefined);

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

    function deleteFriend(userID) {
        const data = {
            token: Cookies.get('token'),
            userID: userID,
            //Delete Command
            command: 1
        }
        axios.post(`${Config.API_HOST}/managefriend`, data);

        const input = [{users: friends, set: setFriends}, {users: friendRequests, set: setFriendRequests}];
        for (let j = 0; j < input.length; j++) {
            let userarr = input[j];
            for (let i = 0; i < userarr.users.length; i++) {
                if (userarr.users[i].userID === userID) {
                    userarr.users.splice(i, 1);
                    userarr.set([...userarr.users]);
                    break;
                }
            }
        }
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
                            onDelete={(userID, username) => {setDeleteUser({userID: userID, username: username})}}
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
                deleteUser !== undefined &&
                <YesNo
                    text={`Remove ${deleteUser.username}?`}
                    yesCallback={() => {deleteFriend(deleteUser.userID); setDeleteUser(undefined);}}
                    noCallback={() => setDeleteUser(undefined)}
                />
            }

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
        this.onDelete = props.onDelete;
    }

    onClick = (link) => {
        this.props.history.push(link);
    };

    render() {

        let options = [];

        switch (this.status) {
            case 2:
                options.push(
                    {
                        name: "Trade",
                        onClick: () => this.onClick("/trade/" + this.props.userID)
                    }
                )
                options.push(
                    {
                        name: "Remove",
                        color: "#be0303",
                        onClick: () => {
                            if (this.onDelete) this.onDelete(this.props.userID, this.props.username);
                        }
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

export default withRouter(Friendlist);
export {FriendComponent};
