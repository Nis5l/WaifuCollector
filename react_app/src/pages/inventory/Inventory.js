import React, {Component} from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import {withRouter} from 'react-router-dom'
import WaifuCard, {parseCards} from '../../components/WaifuCard'
import InfiniteScroll from 'react-infinite-scroller'
import Select from 'react-select'
import Scrollbar from '../../components/ScrollBar'
import redirectIfNecessary from '../../components/Redirecter'
import Loading from '../../components/Loading'

import "./Inventory.scss"
import Config from '../../config.json'

class Inventory extends Component {
  constructor(props) {
    super(props);

    this.card_wrapper = React.createRef();
    this.key = 0;
    this.page = 0;
    this.scrollpadding = 500;
    this.userID = props.userID;
    if (this.userID === undefined && this.props.match && this.props.match.params)
      this.userID = this.props.match.params.id;
    if (this.userID === undefined) this.userID = Cookies.get('userID');

    this.friendID = props.friendID;
    this.excludeSuggestions = this.props.excludeSuggestions === true;

    this.redirect = props.redirect === false ? false : "true";
    this.onCardClick = props.onCardClick;

    this.lCounter = 0;
    this.lCounterMax = 1;

    this.hasMore = true;
    this.loadingCards = false;

    this.state =
    {
      cards: [],
      errorMessage: undefined,
      loading: true
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
    if (this.card_wrapper == null || !this.hasMore || this.loadingCards) return;
    this.loadingCards = true;
    const search = this.searchInput.current.value;
    const sortType = this.sortMethod;

	let data = {
		page: this.page,
		search: search,
		sortType: sortType,
	};
	
	if (this.friendID) {
		data.friend = {
			friendId: this.friendID,
			excludeSuggestions: this.excludeSuggestions
		};
	}

    axios.post(`${Config.API_HOST}/user/${this.userID}/inventory`, data)
      .then(res => {
          this.incrementLCounter();

          this.page++;

		  parseCards(res.data);
		  let cards = [...this.state.cards, ...res.data];
		  this.key++;
		  this.loadingCards = false;
		  if (res.data.length === 0) this.hasMore = false;
		  this.setState({cards: cards});
      }).catch(err => {
          if (redirectIfNecessary(this.props.history, err)) return;
		  if(err.response)
			  this.setState({errorMessage: err.response.data.error});
		  else
			  this.setState({errorMessage: "Internal error"});
	  });
  }

  incrementLCounter() {
    this.lCounter++;
    if (this.lCounter === this.lCounterMax) this.setState({loading: false});
  }

  onFilter(e, obj) {
    if (e !== undefined) e.preventDefault();
    obj.key = 0;
    this.hasMore = true;
    this.page = 0;
    obj.setState({cards: []});
  }

  onCardClick(e, card) {
    if (this.onCardClick !== undefined) this.onCardClick(e, card);
  }

  render() {
    return (
      <div className="inventory_wrapper">
        <Loading loading={this.state.loading || this.props.loading === true} />
        <form action="#" onSubmit={(e) => {this.onFilter(e, this);}} className="inventory_input">
          <input ref={this.searchInput} type="text" className="text_input" onChange={(e) => this.onFilter(e, this)} />
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
                  < div className="inventory_card_wrapper" key={"card-" + card.id}>
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
