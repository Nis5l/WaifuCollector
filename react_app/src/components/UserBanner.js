import React, {Component} from 'react'
import {Badge} from './ProfileName'
import ResizeText from './ResizeText'

import './UserBanner.scss'

class UserBanner extends Component {
    constructor(props) {
        super(props);

        this.state =
        {
            friend: this.props.friend,
            username: this.props.username,
            userID: this.props.userID,
            badges: this.props.badges
        }
    }

    render() {
        let id = 0;
        return (
            <div className="user_banner">
                <img src="/assets/Icon.png" alt="Avatar" />
                <div className="username">
                    <a href={"/profile/" + this.state.userID}><ResizeText>{this.state.username}</ResizeText></a>
                    <div className="badges">
                        {
                            this.state.badges.map((badge) => {
                                return (
                                    <Badge
                                        key={'badge-' + id++}
                                        img={badge.asset}
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
            </div>
        )
    }
}

export default UserBanner;
