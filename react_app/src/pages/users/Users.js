import React, {Component} from 'react'
import axios from 'axios'
import InfiniteScroll from 'react-infinite-scroller'
import Scrollbar from '../../components/ScrollBar'
import UserBanner from '../../components/UserBanner'

import Config from '../../config.json'

import './Users.scss'

class Users extends Component {
  constructor(props) {
    super(props);

    this.page = 0;
    this.loading = false;

    this.username = "";

    this.state =
    {
      users: []
    }
  }

  search(e, self) {
    this.page = 0;
    this.setState({users: []})
  }

  trackScrolling = () => {
    console.log(this.loading);
    if (this.loading) return;
    this.loading = true;

    axios.get(`${Config.API_HOST}/users?username=${this.username}&page=${this.page}`)
      .then((res) => {
        if (res.data && res.data.status === 0) {
          this.setState({users: [...this.state.users, ...res.data.users]});
          this.page++;
          this.loading = false;
        }
      });
  }

  render() {
    return (
      <div className="users_wrapper">
        <div className="users_input">
          <input onChange={(e) => {this.search(e, this)}} type="text" className="text_input" placeholder="Username" />
        </div>
        <div className="users">
          <Scrollbar>
            <InfiniteScroll
              pageStart={0}
              loadMore={this.trackScrolling}
              hasMore={true}
              className="banner_wrapper"
              useWindow={false}
            >
              {
                this.state.users.map((user) => (
                  <UserBanner username={user.username} userID={user.id} key={"user-" + user.id} />
                ))
              }
            </InfiniteScroll>
          </Scrollbar>
        </div>
      </div>
    )
  }

}

export default Users;
