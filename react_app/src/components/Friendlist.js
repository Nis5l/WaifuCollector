import React, {useState, useEffect} from 'react'

import ConditionalWrapper from './ConditionalWrapper'

import axios from 'axios'
import Config from '../config.json'

import './Friendlist.scss'
import ProfileName from './ProfileName'

import {withRouter} from 'react-router-dom';

import ThreeDotsMenu from './ThreeDotsMenu.js'

import Scrollbar from './ScrollBar'

function Friendlist(props) {

    const [friends, setFriends] = useState([]);

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

            setFriends(filteredFriends);

            incrementLCounter()
        }

        fetchData();

    }, [props.userID]);

    function incrementLCounter() {
        lcounter++;
        if (lcounter === lcounterMax && props.lCallback) props.lCallback();
    }

    if (props.userID === undefined)
        return (<div className="friendslist"></div>);

    return (

        <div
            className="friendslist"
        >
            <ConditionalWrapper
                condition={window.screen.availWidth > 768}
                wrapper={Scrollbar}
            >
                <ul>
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
            </ConditionalWrapper>

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
            case 1:
                options.push(
                    {
                        name: "Befriend",
                        onClick: () => this.onClick("/trade/" + this.props.userID)
                    }
                )
                break;
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
