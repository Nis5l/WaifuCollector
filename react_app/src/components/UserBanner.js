import React, {Component} from 'react'

import './UserBanner.scss'

class UserBanner extends Component {
    constructor(props) {
        super(props);

        this.userID = this.props.userID;
        this.username = this.props.username;
    }

    render() {
        return (
            <div className="user_banner">
                <img src="/assets/Icon.png" alt="Avatar" />
                <a href={"/profile/" + this.userID}>{this.username}</a>
            </div>
        )
    }
}

//function UserBanner(props) {
//return (
//<div className="user_banner">
//<img src="/assets/Icon.png" alt="Avatar" />
//<a href={"/profile/" + props.userID}>{props.username}</a>
//</div>
//)
//}

export default UserBanner;
