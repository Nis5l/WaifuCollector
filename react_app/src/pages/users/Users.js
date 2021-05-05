import React, {Component} from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
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
    this.hasMore = true;

    this.username = "";

    this.state =
    {
      users: [],
      friends: {}
    }
  }

  search(e, self) {
    this.page = 0;
    this.loading = false;
    this.hasMore = true;
    this.username = e.target.value;
    this.setState({users: []});
  }

  componentDidMount() {
    axios.post(Config.API_HOST + "/friends", {id: Cookies.get('userID'), })
      .then((res) => {
        if (res.data && res.data.status === 0) {
          let friends = {};
          for (let i = 0; i < res.data.friends.length; i++) {
            friends[res.data.friends[i].userID] = res.data.friends[i].status;
          }
          this.setState({friends: friends});
        }
      });
  }

  trackScrolling = () => {
    if (this.loading || !this.hasMore) return;
    this.loading = true;

    axios.get(`${Config.API_HOST}/users?username=${this.username}&page=${this.page}`)
      .then((res) => {
        if (res.data && res.data.status === 0) {
          if (!this.loading) return;
          if (res.data.users.length === 0) this.hasMore = false;
          this.loading = false;
          this.page++;
          const users = [...this.state.users, ...res.data.users];
          this.setState({users: users});
        }
      });
  }

  getFriend(id) {
    return this.state.friends[id] !== undefined ? this.state.friends[id] : 0;
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
                  <UserBanner
                    username={user.username}
                    badges={user.badges}
                    userID={user.id}
                    key={"user-" + user.id + "-" + this.getFriend(user.id)}
                    friend={this.getFriend(user.id)} />
                ))
              }
            </InfiniteScroll>
          </Scrollbar>
        </div>
      </div >
    )
  }

}

export default Users;
