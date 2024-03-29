import React, {Component} from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import WaifuCard, {parseCards, WaifuCardLoad} from '../../components/WaifuCard'
import InfiniteScroll from 'react-infinite-scroller'
import {YesNo} from '../../components/Popup'
import {withRouter} from 'react-router-dom'
import Scrollbar from '../../components/ScrollBar'
import redirectIfNecessary from '../../components/Redirecter'
import Loading from '../../components/Loading'

import Config from '../../config.json'

import './CardPage.scss'

class CardPage extends Component {
  constructor(props) {
    super();
    this.props = props;
    this.mainuuid = parseInt(props.match.params.id);

    this.card_wrapper = React.createRef();

    this.key = 0;
    this.page = 0;

    this.lCounter = 0;
    this.lCounterMax = 2;

    this.loadingCards = false;

    this.state =
    {
      mainwaifucard: undefined,
      maincard: undefined,
      cards: undefined,
      hasMore: true,
      upgradeId: undefined,
      focus: false,
      upgradeSuccess: undefined,
      upgradeColor: undefined,
      loading: true
    }
  }

  componentDidMount() {
    axios.get(`${Config.API_HOST}/card/${this.mainuuid}`)
      .then(res => {
        if (redirectIfNecessary(this.props.history, res.data)) return;
        this.incrementLCounter();
        parseCards([res.data]);
        this.setState({maincard: res.data});
      }).catch(err => {
        this.setState({maincard: -1});
	  });

    this.trackScrolling();
  }

  incrementLCounter() {
    this.lCounter++;
    if (this.lCounter === this.lCounterMax) this.setState({loading: false});
  }

  trackScrolling = () => {
    if (this.state.maincard === -1) {
      return this.incrementLCounter();
    }
    if (this.card_wrapper == null ||
      !this.state.hasMore ||
      this.state.maincard === undefined ||
      this.loadingCards === true) return;

    this.loadingCards = true;

	const data = {
		page: this.page,
		level: this.state.maincard.level,
		cardId: this.state.maincard.cardInfo.id,
		excludeUuids: [this.mainuuid]
	};

    axios.post(`${Config.API_HOST}/user/${Cookies.get('userID')}/inventory`, data)
      .then(res => {
            this.incrementLCounter();

            parseCards(res.data);
            let cards;
            if (this.state.cards !== undefined)
              cards = [...this.state.cards, ...res.data];
            else
              cards = [...res.data];

            this.page++;
            this.key++;
            if (res.data.length === 0) this.setState({hasMore: false});
            this.loadingCards = false;
        	this.setState({cards: cards});
      }).catch(err => {
          redirectIfNecessary(this.props.history, err);
	  });
  }

  onCardClick = (e, uuid) => {
    this.setState({upgradeId: uuid});
  }

  upgradeCallback = () => {

    for (let i = 0; i < this.state.cards.length; i++) {
      if (this.state.cards[i].id === this.state.upgradeId) {
        this.state.cards.splice(i, 1);
        break;
      }
    }

    this.state.mainwaifucard.startUpgradeEffect();
    this.state.mainwaifucard.focusCard();

	const config =
	{
		headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
	}

    let data =
    {
      cardOne: this.mainuuid,
      cardTwo: this.state.upgradeId
    }

    this.setState({upgradeId: undefined, focus: true});

    let newcard = undefined;
    let success = undefined;

    axios.post(`${Config.API_HOST}/card/upgrade`, data, config)
      .then(res => {
		success = res.data.success;
		axios.get(`${Config.API_HOST}/card/${res.data.card}`)
		  .then(res => {
			  parseCards([res.data]);
			  newcard = res.data;
		  }).catch(err => {
			  this.setState({maincard: -1});
		  });
      }).catch(err => {
		  redirectIfNecessary(this.props.history, err);
	  });

    let startTimeout = (time) => {
      setTimeout(() => {
        if (newcard !== undefined) {
          this.state.mainwaifucard.endUpgradeEffect();

          this.mainuuid = newcard.id;

          let color = undefined;

          if (success === false) color = "#4a0909aa";
          else if (success === true) color = "#083200aa";

          this.setState({maincard: newcard, upgradeSuccess: success, upgradeColor: color});

          setTimeout(() => {
            document.body.classList.add('clickable');
            this.state.mainwaifucard.setClickable(true);
            document.addEventListener('click', this.onUpgradeFinishedClick);
          }, 300);

          return;
        }
        startTimeout(500);
      }, time);
    }

    startTimeout(2000);
  }

  cancelUpgradeCallback = () => {
    this.setState({upgradeId: undefined});
  }

  onUpgradeFinishedClick = () => {
    this.props.history.push(`/card/${this.mainuuid}`)
    this.props.history.go();
  }

  render() {

    let mainsize = 1;
    let size = 0.8;
    if (window.screen.availWidth < 993) {
      mainsize = 0.7;
      size = 0.5;
    }

    return (
      <div className="cardpage_wrapper">
        <Loading loading={this.state.loading} />
        {
          this.state.upgradeId !== undefined &&
          <YesNo
            yesCallback={this.upgradeCallback}
            noCallback={this.cancelUpgradeCallback}
            text="Upgrade?"
          />
        }
        <div className="card_wrapper_wrapper">
          <Scrollbar>
            <InfiniteScroll
              pageStart={0}
              loadMore={this.trackScrolling}
              hasMore={this.state.hasMore}
              className="card_wrapper"
              useWindow={false}
            >
              {
                this.state.cards !== undefined && this.state.cards.length === 0 &&
                (
                  <div className="pack_empty">
                    No Cards
                  </div>
                )
              }
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
                this.state.cards !== undefined && this.state.cards.map((card) => (
                  < div className="cardpage_card_wrapper" key={"card-" + this.key++}>
                    <WaifuCard
                      card={card}
                      size={size}
                      cardcolor="transparent"
                      clickable="true"
                      onClick={this.onCardClick}
                    >
                    </WaifuCard>
                  </div>
                ))
              }
            </InfiniteScroll>
          </Scrollbar>
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
            this.state.focus === true &&
            <div
              className="blurbackground"
              style=
              {{
                backgroundColor: `${this.state.upgradeColor !== undefined ? this.state.upgradeColor : ""}`
              }}
            />
          }
          {
            this.state.maincard !== undefined && this.state.maincard !== -1 &&
            <WaifuCard
              onCreate={(obj) => {this.setState({mainwaifucard: obj})}}
              card={this.state.maincard}
              size={mainsize}
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

export default withRouter(CardPage);
