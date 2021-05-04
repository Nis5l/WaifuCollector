import React, {Component} from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import {withRouter} from 'react-router-dom'
import WaifuCard, {parseCards} from '../../components/WaifuCard'
import InfiniteScroll from 'react-infinite-scroller'
import Select from 'react-select'
import Scrollbar from '../../components/ScrollBar'
import redirectIfNecessary from '../../components/Redirecter'

import "./Inventory.scss"
import Config from '../../config.json'

class Inventory extends Component {
  constructor(props) {
    super(props);

    this.card_wrapper = React.createRef();
    this.key = 0;
    this.scrollpadding = 500;
    this.friendid = props.match !== undefined &&
      props.match.params !== undefined ? props.match.params.id : undefined;
    if (props.userID !== undefined) this.friendid = props.userID;
    this.friend = props.friend === true ? true : undefined;

    this.redirect = props.redirect === false ? false : "true";
    this.onCardClick = props.onCardClick;

    this.state =
    {
      cards: [],
      hasMore: true,
      errorMessage: undefined
    };
    this.options =
      [
        {value: 0, label: 'Name'},
        {value: 1, label: 'Level'},
        {value: 2, label: 'Recent'}
      ];

    this.searchInput = React.createRef();
    this.sortMethod = undefined;
  }

  trackScrolling = () => {
    if (this.card_wrapper == null || !this.state.hasMore) return;
    let data;
    const search = this.searchInput.current.value;
    const sortType = this.sortMethod;

    if (this.key === 0)
      data = {
        token: Cookies.get("token"),
        page: 0,
        search: search,
        sortType: sortType,
        userID: this.friendid,
        friend: this.friend
      };
    else
      data = {token: Cookies.get("token"), next: 0};

    axios.post(`${Config.API_HOST}/inventory`, data)
      .then(res => {
        if (res && res.status === 200) {

          if (redirectIfNecessary(this.props.history, res.data)) return;

          if (res.data && res.data.status === 0) {
            parseCards(res.data.inventory);
            let cards = [...this.state.cards, ...res.data.inventory];
            this.key = 0;
            if (res.data.page === res.data.pagemax) this.setState({hasMore: false});
            this.setState({cards: cards});
          } else {
            this.setState({errorMessage: res.data.message});
          }
        } else {
          this.setState({errorMessage: "Internal error"});
        }
      });
  }

  onFilter(e, obj) {
    if (e !== undefined) e.preventDefault();
    obj.key = 0;
    obj.setState({cards: [], hasMore: true});
  }

  onCardClick(e, card) {
    if (this.onCardClick !== undefined) this.onCardClick(e, card);
  }

  render() {
    return (
      <div className="inventory_wrapper">
        <form action="#" onSubmit={(e) => {this.onFilter(e, this);}} className="inventory_input">
          <input ref={this.searchInput} type="text" className="text_input" />
          <input type="submit" hidden />
          <Select
            className="inventory_select"
            onChange={(sel) => {this.sortMethod = sel.value; this.onFilter(undefined, this)}}
            options={this.options}
            threshold={500}
            defaultValue={this.options[0]}
            /* Doesnt work
            hasMore={this.state.hasMore}
             */
            theme={theme => ({
              ...theme,
              borderRadius: 5,
              colors: {
                ...theme.colors,
                /* Outline SelectHighlight */
                primary: '#d8d8d8',
                /* Background */
                neutral0: '#1E1E1E',
                /* Text */
                neutral80: '#d8d8d8',
                /* Highlight */
                primary25: '#252525',
                /* ClickHighlight */
                primary50: 'gray',
                /* Border */
                neutral20: '#9d9d9d',
              },
            })}
          />
        </form>
        <div
          className="card_wrapper"
        >
          <Scrollbar>
            <InfiniteScroll
              pageStart={0}
              loadMore={this.trackScrolling}
              hasMore={true}
              className="card_wrapper"
              useWindow={false}
            >
              {
                this.state.errorMessage === undefined ? this.state.cards.map((card) => (
                  < div className="inventory_card_wrapper" key={"card-" + this.key++}>
                    <WaifuCard
                      onClick={this.onCardClick}
                      card={card}
                      size="1"
                      cardcolor="transparent"
                      clickable="true"
                      redirects={this.redirect}
                    >
                    </WaifuCard>
                  </div>
                )) :
                  (
                    <h1> {this.state.errorMessage} </h1>
                  )
              }
            </InfiniteScroll>
          </Scrollbar>
        </div>
      </div>
    );
  }
}

export default withRouter(Inventory);
