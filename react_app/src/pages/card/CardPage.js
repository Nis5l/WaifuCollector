import React, {Component} from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import WaifuCard, {parseCards, WaifuCardLoad} from '../../components/WaifuCard'
import InfiniteScroll from 'react-infinite-scroller';
import {YesNo} from '../../components/Popup'

import Config from '../../config.json'

import './CardPage.scss'

class CardPage extends Component {
  constructor(props) {
    super();
    this.props = props;
    this.mainuuid = props.match.params.id;

    this.mainwaifucard = undefined;
    this.card_wrapper = React.createRef();

    this.key = 0;
    this.state =
    {
      maincard: undefined,
      cards: undefined,
      hasMore: true,
      upgradeId: undefined,
    }
  }

  componentDidMount() {
    axios.post(`${Config.API_HOST}/card`, {token: Cookies.get('token'), card: this.mainuuid})
      .then(res => {
        if (res && res.status === 200 && res.data && res.data.status === 0) {
          parseCards([res.data.card]);
          this.setState({maincard: res.data.card});
          return;
        }
        this.setState({maincard: -1});
      });
  }

  trackScrolling = () => {
    if (this.card_wrapper == null ||
      !this.state.hasMore ||
      this.state.maincard === undefined ||
      this.state.maincard === -1) return;

    let data;

    if (this.key === 0)
      data =
      {
        token: Cookies.get("token"),
        page: 0,
        exclude: this.mainuuid,
        id: this.state.maincard.card.id,
        level: this.state.maincard.level
      };
    else
      data = {token: Cookies.get("token"), next: 0};

    axios.post(`${Config.API_HOST}/inventory`, data)
      .then(res => {
        if (res && res.status === 200) {
          if (res.data && res.data.status === 0) {
            parseCards(res.data.inventory);
            let cards;
            if (this.state.cards !== undefined)
              cards = [...this.state.cards, ...res.data.inventory];
            else
              cards = [...res.data.inventory];
            this.key = 0;
            if (res.data.page === res.data.pagemax) this.setState({hasMore: false});
            this.setState({cards: cards});
          }
        }
      });
  }

  onCardClick = (e, uuid) => {
    this.setState({upgradeId: uuid});
  }

  upgradeCallback = () => {

    this.setState({upgradeId: undefined});
    this.mainwaifucard.startUpgradeEffect();
    this.mainwaifucard.focusCard();

    let data =
    {
      token: Cookies.get('token'),
      mainuuid: this.mainuuid,
      carduuid: this.state.upgradeId
    }

    let newcard = undefined;

    axios.post(`${Config.API_HOST}/upgrade`, data)
      .then(res => {
        console.log(res);
        if (res && res.status === 200) {
          if (res.data && res.data.status === 0) {
            axios.post(`${Config.API_HOST}/card`, {token: Cookies.get('token'), card: res.data.uuid})
              .then(res => {
                if (res && res.status === 200 && res.data && res.data.status === 0) {
                  parseCards([res.data.card]);
                  newcard = res.data.card;
                  return;
                }
                this.setState({maincard: -1});
              });
          }
        }
      });

    let startTimeout = (time) => {
      setTimeout(() => {
        console.log(newcard)
        if (newcard !== undefined) {
          this.mainwaifucard.endUpgradeEffect();

          this.mainuuid = newcard.id;

          this.setState({maincard: newcard});

          return;
        }
        startTimeout(500);
      }, time);
    }

    startTimeout(3000);
  }

  cancelUpgradeCallback = () => {
    this.setState({upgradeId: undefined});
  }

  render() {
    return (
      <div className="cardpage_wrapper">
        {
          this.state.upgradeId !== undefined &&
          <YesNo
            yesCallback={this.upgradeCallback}
            noCallback={this.cancelUpgradeCallback}
          />
        }
        <div className="card_wrapper">
          {
            this.state.cards === undefined &&
            (
              <div className="pack_load">
                <WaifuCardLoad size="1">
                </WaifuCardLoad>
              </div>
            )
          }
          {
            this.state.cards !== undefined && this.state.cards.length === 0 &&
            (
              <div className="pack_empty">
                No Cards
              </div>
            )
          }
          <InfiniteScroll
            pageStart={0}
            loadMore={this.trackScrolling}
            hasMore={true || false}
            className="card_wrapper"
            useWindow={false}
          >
            {
              this.state.cards !== undefined && this.state.cards.map((card) => (
                < div className="cardpage_card_wrapper" key={"card-" + this.key++}>
                  <WaifuCard
                    card={card}
                    size="0.8"
                    cardcolor="transparent"
                    clickable="true"
                    onClick={this.onCardClick}
                  >
                  </WaifuCard>
                </div>
              ))
            }
          </InfiniteScroll>
        </div>
        <div className="cardpage_maincard">
          {
            this.state.maincard !== undefined && this.state.maincard === -1 &&
            (
              <div className="pack_empty">
                Card not found
              </div>
            )
          }
          {
            this.state.maincard !== undefined && this.state.maincard !== -1 &&
            <WaifuCard
              onCreate={(obj) => {this.mainwaifucard = obj}}
              card={this.state.maincard}
              size="1"
              cardcolor="transparent"
              clickable="false"
            >
            </WaifuCard>
          }
          {
            this.state.maincard === undefined &&
            (
              <div className="pack_load">
                <WaifuCardLoad size="1">
                </WaifuCardLoad>
              </div>
            )
          }
        </div>
      </div >
    )
  }
}

export default CardPage;
