import React, {Component, createRef, RefObject} from 'react'

import {YesNo} from './Popup'

import './Friendlist.scss'
import ProfileName from './ProfileName'

import ThreeDotsMenu from './ThreeDotsMenu'

import Scrollbar from './ScrollBar'
import { AxiosPrivateProps, withAxiosPrivate } from '../hooks/useAxiosPrivate'
import { ReactRouterProps, withRouter } from '../hooks/withRouter'

interface User {
    userID: string,
    username: string
}

type PropsFriendlist = ReactRouterProps & AxiosPrivateProps & {
    userID: string,
    requests?: boolean,
    onFriendRequests?: (len: number) => void,
    onFriendData?: (friends: any[]) => void,
    decrementRequests?: () => void,
    lCallback?: () => void
}

type StateFriendlist = {
    friends: any[],
    friendRequests: any[],
    width: number,
    deleteUser: User | undefined
}

class Friendlist extends Component<PropsFriendlist, StateFriendlist> {
    public props: PropsFriendlist;

    private lcounter: number;
    private lcounterMax: number;

    private resizeMethod: () => void;

    public componentMounted: boolean = false;

    constructor(props: PropsFriendlist) {
        super(props);
        this.props = props;

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
        this.componentMounted = true;

        async function loadFriends(self: Friendlist) {
			try {
				const response = await self.props.axios.get(`/user/${self.props.userID}/friends`);
				return response.data;
			} catch (err) {
				console.log("Unexpected /user/:id/friends error");
                return [];
			}
        }

        async function fetchData(self: Friendlist) {

            let friends = await loadFriends(self);
            const filteredFriends = friends.filter((friend: any) => friend.status === 0);
            if (self.props.onFriendRequests) {
                const friendrqs = friends.filter((friend: any) => friend.status === 1);
                if(self.componentMounted) self.setState({friendRequests: friendrqs});
                self.props.onFriendRequests(friendrqs.length);
            }

            if(self.componentMounted){
                self.setState({friends: filteredFriends});
                self.incrementLCounter();
            }

            if (self.props.onFriendData) self.props.onFriendData(friends);
        }

        fetchData(this);

        window.addEventListener('resize', this.resizeMethod);
    }

    componentWillUnmount() {
        this.componentMounted = false;
        window.removeEventListener('resize', this.resizeMethod);
    }

    incrementLCounter() {
        this.lcounter++;
        if (this.lcounter === this.lcounterMax && this.props.lCallback) this.props.lCallback();
    }

    deleteFriend(userID: string) {
        const data = {
            userId: userID
        }
        this.props.axios.post(`/friend/remove`, data);

        for (let i = 0; i < this.state.friends.length; i++) {
            if (this.state.friends[i].userId === userID) {
                this.state.friends.splice(i, 1);
                this.setState({friends: [...this.state.friends]});
                break;
            }
        }

        for (let i = 0; i < this.state.friendRequests.length; i++) {
            if (this.state.friendRequests[i].userId === userID) {
                this.state.friendRequests.splice(i, 1);
                this.setState({friendRequests: [...this.state.friendRequests]});
                break;
            }
        }
    }

    onDecline(userID: string) {
        this.deleteFriend(userID);
        if (this.props.decrementRequests) this.props.decrementRequests();
    }

    onAccept(userID: string) {
        const data = {
            userId: userID
        }
        this.props.axios.post(`/friend/accept`, data);

        for (let i = 0; i < this.state.friendRequests.length; i++) {
            if (this.state.friendRequests[i].userId === userID) {
                this.state.friends.push(this.state.friendRequests[i])
                let newreq = this.state.friendRequests[i];
                newreq.status = 0;
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
                                key={friend.userId}

                                avatar="/assets/Icon.png"
                                userID={friend.userId}
                                status={friend.status}
                                username={friend.username}
                                onDelete={(userID: string, username: string) => { this.setState({ deleteUser: { userID: userID, username: username } }) } }
                                />
                        )

                    })}
                </ul>
                <ul className={this.props.requests ? "showFriends" : "hideFriends"}>
                    {this.state.friendRequests.map((friend) => {

                        return (
                            <FriendComponent
                                key={friend.userId}

                                avatar="/assets/Icon.png"
                                userID={friend.userId}
                                status={friend.status}
                                username={friend.username}
                                onAccept={(userID: string) => this.onAccept(userID)}
                                onDecline={(userID: string) => this.onDecline(userID)}
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
                        yesCallback={() => { if(this.state.deleteUser != null) this.deleteFriend(this.state.deleteUser.userID); this.setState({deleteUser: undefined});}}
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

type PropsFriend = ReactRouterProps & {
    userID: string,
    username: string,
    status: number,
    avatar: string
    onDelete?: (userID: string, username: string) => void,
    onAccept?: (userID: string) => void,
    onDecline?: (userID: string) => void
}

type StateFriend = {
    username: string
}

class Friend extends React.Component<PropsFriend, StateFriend> {
    
    private status: number;
    private onDelete: (userID: string, username: string) => void;
    private onAccept: (userID: string) => void;
    private onDecline: (userID: string) => void;

    private resizeMethod: () => void;

    private friendlist: RefObject<any>;

    constructor(props: PropsFriend) {
        super(props);

        this.status = props.status;
        this.onDelete = props.onDelete != null ? props.onDelete : () => {};

        this.onAccept = props.onAccept != null ? props.onAccept : () => {};
        this.onDecline = props.onDecline != null ? props.onDecline : () => {};

        this.resizeMethod = () => {this.resize(this)};

        this.friendlist = createRef();

        this.state = {username: this.props.username}
    }

    onClick = (link: string) => {
        this.props.router.navigate(link);
    };

    componentDidMount() {
        window.addEventListener('resize', this.resizeMethod);
        window.addEventListener('load', this.resizeMethod);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeMethod);
        window.removeEventListener('load', this.resizeMethod);
    }

    resize(self: Friend) {
        let username = self.props.username;
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
            case 0:
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
                    badges={undefined}
                    lCallback={() => {}}
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

export default withAxiosPrivate(withRouter(Friendlist));
export {FriendComponent};
