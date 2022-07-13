import {Component} from 'react'
import {Badge} from './ProfileName'
import Config from "../config.json"

import './UserBanner.scss'
import { Link } from 'react-router-dom'

interface BadgeData {
    name: string,
    asset: string
}

type PropsUserBanner = {
    userID: number,
    username: string,
    friend: number,
    badges: BadgeData[]
}

type StateUserBanner = {
    userID: number,
    username: string,
    badges: BadgeData[],
    friend: number
}

class UserBanner extends Component<PropsUserBanner, StateUserBanner> {
    private username: string;
    private resizeMethod: () => void;

    constructor(props: PropsUserBanner) {
        super(props);

        this.username = this.props.username;

        this.resizeMethod = () => {this.resize(this)};

        this.state =
        {
            friend: this.props.friend,
            username: this.props.username,
            userID: this.props.userID,
            badges: this.props.badges
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.resizeMethod);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeMethod);
    }

    resize(self: UserBanner) {
        let username = self.username;
        if (window.screen.availWidth <= 730) {
            if (username.length > 15) username = username.slice(0, 12) + "...";
        }

        self.setState({username: username});
    }

    render() {
        let id = 0;
        return (
            <div className="user_banner">
                <img src="/assets/Icon.png" alt="Avatar" />
                <div className="username">
                    <Link style={{overflow: "hidden"}} to={"/profile/" + this.state.userID}>{this.state.username}</Link>
                    <div className="badges">
                        {
                            this.state.badges.map((badge) => {

                                let badgeImage = Config.API_HOST + badge.asset;

                                return (
                                    <Badge
                                        key={'badge-' + id++}
                                        img={badgeImage}
                                        name={badge.name}
                                    />
                                )
                            })

                        }
                    </div>
                </div>
                {
                    this.state.friend === 2 &&
                    <i className="fas fa-lg fa-user-friends"></i>
                }
            </div >
        )
    }
}

export default UserBanner;
