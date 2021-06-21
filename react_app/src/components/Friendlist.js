import React, {Component, useState, useEffect, createRef} from 'react'

import {YesNo} from './Popup'

import axios from 'axios'
import Config from '../config.json'
import Cookies from 'js-cookie'

import './Friendlist.scss'
import ProfileName from './ProfileName'

import {withRouter} from 'react-router-dom';

import ThreeDotsMenu from './ThreeDotsMenu.js'

import Scrollbar from './ScrollBar'

class Friendlist extends Component {

    constructor(props) {
        super(props);

        this.lcounter = 0;
        this.lcounterMax = 1;

        this.resizeMethod = () => {
            this.setState({width: window.screen.availWidth});
        }

        this.state =
        {
            friends: [],
            friendRequests: [],
            width: window.screen.availWidth,
            deleteUser: undefined
        }
    }

    componentDidMount() {

        async function loadFriends(self) {

            const data = await axios.post(Config.API_HOST + "/friends", {id: self.props.userID});

            if (data.data.status !== 0)
                return [];

            return data.data.friends;

        }

        async function fetchData(self) {

            let friends = await loadFriends(self);

            const filteredFriends = friends.filter((friend) => friend.status === 2);

            if (self.props.onFriendRequests) {
                const friendrqs = friends.filter((friend) => friend.status === 0);
                self.setState({friendRequests: friendrqs});
                self.props.onFriendRequests(friendrqs.length);
            }

            self.setState({friends: filteredFriends});

            self.incrementLCounter()

            if (self.props.onFriendData) self.props.onFriendData(friends);
        }

        fetchData(this);

        window.addEventListener('resize', this.resizeMethod);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeMethod);
    }

    incrementLCounter() {
        this.lcounter++;
        if (this.lcounter === this.lcounterMax && this.props.lCallback) this.props.lCallback();
    }

    deleteFriend(userID) {
        const data = {
            token: Cookies.get('token'),
            userID: userID,
            //Delete Command
            command: 1
        }
        axios.post(`${Config.API_HOST}/managefriend`, data);

        for (let i = 0; i < this.state.friends.length; i++) {
            if (this.state.friends[i].userID === userID) {
                this.state.friends.splice(i, 1);
                this.setState({friends: [...this.state.friends]});
                break;
            }
        }

        for (let i = 0; i < this.state.friendRequests.length; i++) {
            if (this.state.friendRequests[i].userID === userID) {
                this.state.friendRequests.splice(i, 1);
                this.setState({friendRequests: [...this.state.friendRequests]});
                break;
            }
        }
    }

    onDecline(userID) {
        this.deleteFriend(userID);
        if (this.props.decrementRequests) this.props.decrementRequests();
    }

    onAccept(userID) {
        const data = {
            token: Cookies.get('token'),
            userID: userID,
            //Add Command
            command: 0
        }
        axios.post(`${Config.API_HOST}/managefriend`, data);

        for (let i = 0; i < this.state.friendRequests.length; i++) {
            if (this.state.friendRequests[i].userID === userID) {
                this.state.friends.push(this.state.friendRequests[i])
                let newreq = this.state.friendRequests[i];
                newreq.status = 2;
                this.state.friendRequests.splice(i, 1);
                this.setState({friends: [...this.state.friends], friendRequests: [...this.state.friendRequests]});
                break;
            }
        }

        if (this.props.decrementRequests) this.props.decrementRequests();
    }

    render() {

        if (this.props.userID === undefined) return (<div className="friendslist"></div>);

        let inner = (
            <div className="friendRequests">
                <ul className={this.props.requests ? "hideFriends" : "showFriends"}>
                    {this.state.friends.map((friend) => {

                        return (
                            <FriendComponent
                                key={friend.userID}
                                avatar="/assets/Icon.png"
                                userID={friend.userID}
                                status={friend.status}
                                username={friend.username}
                                onDelete={(userID, username) => {this.setState({deleteUser: {userID: userID, username: username}})}}
                            />
                        )

                    })}
                </ul>
                <ul className={this.props.requests ? "showFriends" : "hideFriends"}>
                    {this.state.friendRequests.map((friend) => {

                        return (
                            <FriendComponent
                                key={friend.userID}
                                avatar="/assets/Icon.png"
                                userID={friend.userID}
                                status={friend.status}
                                username={friend.username}
                                onAccept={(userID) => this.onAccept(userID)}
                                onDecline={(userID) => this.onDecline(userID)}
                            />
                        )

                    })}

                </ul>
            </div >
        )

        return (

            < div
                className="friendslist"
            >

                {
                    this.state.deleteUser !== undefined &&
                    <YesNo
                        text={`Remove ${this.state.deleteUser.username}?`}
                        yesCallback={() => {this.deleteFriend(this.state.deleteUser.userID); this.setState({deleteUser: undefined});}}
                        noCallback={() => this.setState({deleteUser: undefined})}
                    />
                }

                {
                    this.state.width > 768 ?
                        <Scrollbar>
                            {inner}
                        </Scrollbar>
                        :
                        inner
                }

            </div >

        )
    }
}

class Friend extends React.Component {

    constructor(props) {
        super(props);
        this.status = props.status;
        this.onDelete = props.onDelete;

        this.onAccept = props.onAccept;
        this.onDecline = props.onDecline;

        this.resizeMethod = () => {this.resize(this)};

        this.friendlist = createRef();

        this.state = {username: this.props.username}
    }

    onClick = (link) => {
        this.props.history.push(link);
    };

    componentDidMount() {
        window.addEventListener('resize', this.resizeMethod);
        window.addEventListener('load', this.resizeMethod);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeMethod);
        window.removeEventListener('load', this.resizeMethod);
    }

    resize(self) {
        let username = self.props.username;
         //username = "Test1231231231231231";
        if (this.friendlist.current.clientWidth <= 350) {
            if (this.friendlist.current.clientWidth <= 250) {
                if (username.length > 11) username = username.slice(0, 8) + "...";
            }
            else if (username.length > 15) username = username.slice(0, 12) + "...";
        }
        self.setState({username: username});
    }

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

            <li
                className="friend"
                ref={this.friendlist}
                style={{fontSize: this.friendlist.current !== null ? `min(18px, ${this.friendlist.current.clientWidth / 15}px)` : "18px"}}
            >

                <img
                    src={this.props.avatar}
                    alt="Friend Avatar"
                    style={{height: this.friendlist.current !== null ? `min(90%, ${this.friendlist.current.clientWidth / 5}px)` : "18px"}}
                />

                <ProfileName
                    userID={this.props.userID}
                    username={this.state.username}
                />

                {
                    options.length > 0 ?
                        < ThreeDotsMenu
                            menuID={("friendMenu-" + this.props.userID)}
                            options={options}
                        />
                        : (
                            <div className="icons">
                                <i className="fas fa-times" onClick={() => this.onDecline(this.props.userID)} />
                                <i className="fas fa-check" onClick={() => this.onAccept(this.props.userID)} />
                            </div>
                        )
                }

            </li>

        )

    }

}

const FriendComponent = withRouter(Friend);

export default withRouter(Friendlist);
export {FriendComponent};
