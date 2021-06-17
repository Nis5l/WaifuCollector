import React, {Component} from 'react'
import {Badge} from './ProfileName'
import ResizeText from './ResizeText'

import Config from "../config.json"

import './UserBanner.scss'

class UserBanner extends Component {
    constructor(props) {
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

    resize(self) {
        let username = self.username;
        username = "TEST123123123123123";
        console.log(window.screen.availWidth);
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
                    <a style={{overflow: "hidden"}} href={"/profile/" + this.state.userID}>{this.state.username}</a>
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
