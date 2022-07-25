import React, {Component} from 'react'
import axios from 'axios'
import InfiniteScroll from 'react-infinite-scroller'
import ScrollbarComponent from '../../shared/components/scrollbar'
import UserBanner from '../../components/UserBanner'
import Loading from '../../components/Loading'

import Config from '../../config.json'

import './Users.scss'
import { AuthProps, withAuth } from '../../hooks/useAuth'
import { AxiosPrivateProps, withAxiosPrivate } from '../../hooks/useAxiosPrivate'

type PropsUsers = AuthProps & AxiosPrivateProps & {

}

type StateUsers = {
  users: any[],
  friends: Map<number, number>,
  loading: boolean
}

class Users extends Component<PropsUsers, StateUsers> {
  private page: number;
  private loading: boolean;
  private hasMore: boolean;

  private username: string;

  constructor(props: PropsUsers) {
    super(props);

    this.page = 0;
    this.loading = false;
    this.hasMore = true;

    this.username = "";

    this.state =
    {
      users: [],
      friends: new Map<number, number>(),
      loading: true
    }
  }

  search(e: any, self: Users) {
    this.page = 0;
    this.loading = false;
    this.hasMore = true;
    this.username = e.target.value;
    this.setState({users: []});
  }

  componentDidMount() {
    this.props.axios.get(`/user/${this.props.auth.id}/friends`)
      .then((res: any) => {
        this.setState({loading: false});
		let friends: Map<number, number> = new Map<number, number>();
		for (let i = 0; i < res.data.friends.length; i++) {
			friends.set(res.data.friends[i].userID,  res.data.friends[i].status);
			this.setState({friends: friends});
		}
      }).catch((err: any) => {
		console.log("Unexpected /user/:id/friends error");
	  });
  }

  trackScrolling = () => {
    if (this.loading || !this.hasMore) return;
    this.loading = true;

    axios.get(`${Config.API_HOST}/users?username=${this.username}&page=${this.page}`)
      .then(res => {
          if (!this.loading) return;
          if (res.data.length === 0) this.hasMore = false;
          this.loading = false;
          this.page++;
          const users = [...this.state.users, ...res.data];
          this.setState({users: users});
      });
  }

  getFriend(id: number): number {
    const friendId: number | undefined = this.state.friends.get(id);
    return friendId != null ? friendId : 0;
  }

  render() {


    return (
      <div className="users_wrapper">
        <Loading loading={this.state.loading} />
        <div className="users_input">
          <input onChange={(e) => {this.search(e, this)}} type="text" className="text_input" placeholder="Username" />
        </div>
        <div className="users">
          <ScrollbarComponent>
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
          </ScrollbarComponent>
        </div>
      </div >
    )
  }

}

export default withAuth(withAxiosPrivate(Users));
