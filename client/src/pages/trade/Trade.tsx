import React, {Component, RefObject} from 'react'
import Card from '../../components/Card'
import axios from 'axios'
import Config from '../../config.json'
import Cookies from 'js-cookie'
import WaifuCard, {parseCards, WaifuCardLoad} from '../../components/WaifuCard'
import Scrollbar from '../../components/ScrollBar'
import {YesNo, YesNoCancel} from '../../components/Popup'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import redirectIfNecessary from '../../components/Redirecter'
import Loading from '../../components/Loading'
import {formatTime} from '../../Utils'
import moment from 'moment';

import './Trade.scss'

const suggestCardColor = "rgb(255 255 255 / 50%)";

interface TradeParams {
  id: string | undefined
}

type PropsTrade = RouteComponentProps<TradeParams> & {

}

type StateTrade = {
  name: string,
  cards: any | undefined,
  friendcards: any | undefined,
  found: boolean,
  info: string,
  friendinfo: string,
  tradeCount: number,
  friendTradeCount: number,
  tradeLimit: number,
  tradeTime: number,
  cardSuggestions: any | undefined,
  friendCardSuggestions: any | undefined,
  confirmed: number,
  friendConfirmed: number,

  removeId: number | undefined,
  removeFriendSuggestionId: number | undefined,
  removeSuggestionId: number | undefined,

  disabled: any | undefined,
  confirmdisabled: string | undefined,

  loading: boolean
}

class Trade extends Component<PropsTrade, StateTrade> {
  private lCounter: number;
  private lCounterMax: number;

  private friendid: string | undefined;

  private tradeCount1: number = 0;
  private tradeLimit: number = 0;

  private cardfriend: RefObject<any>;

  private timeinterval: NodeJS.Timeout | undefined;

  constructor(props: PropsTrade) {
    super(props);

    this.lCounter = 0;
    this.lCounterMax = 1;

    this.state =
    {
      name: "Loading...",
      cards: undefined,
      friendcards: undefined,
      found: true,
      info: "",
      friendinfo: "",
      tradeCount: 0,
      friendTradeCount: 0,
      tradeLimit: 0,
      tradeTime: 0,
      cardSuggestions: undefined,
      friendCardSuggestions: undefined,
      confirmed: 0,
      friendConfirmed: 0,

      removeId: undefined,
      removeFriendSuggestionId: undefined,
      removeSuggestionId: undefined,

      disabled: undefined,
      confirmdisabled: undefined,

      loading: true
    }

    this.friendid = props.match.params.id;
    this.cardfriend = React.createRef();
  }

  componentDidMount() {
    this.load();
  }

  componentWillReceiveProps(props: PropsTrade) {
    if(this.friendid == props.match.params.id) return;

    this.friendid = props.match.params.id;

    this.setState({
      name: "Loading...",
      cards: undefined,
      friendcards: undefined,
      found: true,
      info: "",
      friendinfo: "",
      tradeCount: 0,
      friendTradeCount: 0,
      tradeLimit: 0,
      cardSuggestions: undefined,
      friendCardSuggestions: undefined,
      confirmed: 0,
      friendConfirmed: 0,

      removeId: undefined,
      removeFriendSuggestionId: undefined,
      removeSuggestionId: undefined,

      disabled: undefined,
      confirmdisabled: undefined
  });

    this.load();
  }

  load() {
	const config =
	{
		headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
	}

    axios.get(`${Config.API_HOST}/trade/${this.friendid}`, config)
      .then(res => {
        this.incrementLCounter();
          parseCards(res.data.selfCards);
          parseCards(res.data.friendCards);
          parseCards(res.data.selfCardSuggestions);
          parseCards(res.data.friendCardSuggestions);

          this.tradeCount1 = res.data.tradeCount1;
          this.tradeLimit = res.data.tradeLimit;

          this.setState({
            name: res.data.friendUsername,
            cards: res.data.selfCards,
            friendcards: res.data.friendCards,
            tradeCount: res.data.selfCards.length,
            friendTradeCount: res.data.friendCards.length,
            tradeLimit: res.data.tradeCardLimit,
            cardSuggestions: res.data.friendCardSuggestions,
            friendCardSuggestions: res.data.selfCardSuggestions,
            confirmed: res.data.selfStatus,
            friendConfirmed: res.data.friendStatus,
			      tradeTime: 0
          }, () => {this.setInfo(); this.setDisabled()});

          if (res.data.tradeTime != null) {
			      res.data.tradeTime = moment(res.data.tradeTime).toDate();
            let interval = this.timeinterval = setInterval(() => {
              let diff = moment(res.data.tradeTime).diff(moment());
              if(diff < 0) diff = 0;
              this.setState({tradeTime: diff}, this.setDisabled)
              if (diff === 0) clearInterval(interval);
            }, 1000)
          }
      }).catch(err => {
          if (redirectIfNecessary(this.props.history, err)) return;
          this.setState({found: false});
	  });
  }

  componentWillUnmount() {
    if (this.timeinterval) clearInterval(this.timeinterval);
  }

  setInfo() {
    this.setState({
      info: this.state.tradeCount + "/" + this.state.tradeLimit + (this.state.confirmed === 1 ? " ✔" : " 🗙"),
      friendinfo: this.state.friendTradeCount + "/" + this.state.tradeLimit + (this.state.friendConfirmed === 1 ? " ✔" : " 🗙"),
    });
  }

  incrementLCounter() {
    this.lCounter++;
    if (this.lCounter === this.lCounterMax) this.setState({loading: false});
  }

  setDisabled() {
    if (this.state.tradeCount >= this.state.tradeLimit)
      this.setState({disabled: "Cardlimit Reached"});
    else
      this.setState({disabled: undefined});

    if (this.state.confirmed === 1)
      this.setState({confirmdisabled: "Already Confirmed"})

    if (this.state.tradeTime !== 0)
      this.setState({confirmdisabled: formatTime(this.state.tradeTime)})
  }

  onCardOwnClick(e: any, uuid : any, self: Trade) {
    self.setState({removeId: uuid});
  }

  onFriendCardSuggestionClick(e: any, uuid: any, self: Trade) {
    self.setState({removeFriendSuggestionId: uuid});
  }

  onCardSuggestionClick(e: any, uuid: any, self: Trade) {
    self.setState({removeSuggestionId: uuid});
  }

  cardOwnRemove = () => {
	const config =
	{
		headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
	}

    for (let i = 0; i < this.state.cards.length; i++) {
      if (this.state.cards[i].id === this.state.removeId) {
        this.state.cards.splice(i, 1);
        break;
      }
    }

    axios.post(`${Config.API_HOST}/trade/${this.friendid}/card/remove/${this.state.removeId}`, {}, config)
      .then(res => {
        this.load()
      });

    this.setState({removeId: undefined, tradeCount: this.state.tradeCount - 1, confirmed: 0, friendConfirmed: 0},
      () => {this.setInfo(); this.setDisabled()});
  }

  cardOwnRemoveCancel = () => {
    this.setState({removeId: undefined});
  }

  cardSuggestionFriendCancel = () => {
    this.setState({removeFriendSuggestionId: undefined});
  }

  cardSuggestionFriendRemove = () => {
	const config =
	{
		headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
	}

    for (let i = 0; i < this.state.friendCardSuggestions.length; i++) {
      if (this.state.friendCardSuggestions[i].id === this.state.removeFriendSuggestionId) {
        this.state.friendCardSuggestions.splice(i, 1);
        break;
      }
    }

    axios.post(`${Config.API_HOST}/trade/${this.friendid}/suggestion/remove/${this.state.removeFriendSuggestionId}`, {}, config)
      .then((res) => {
        this.load()
      }).catch(err => {
        if (redirectIfNecessary(this.props.history, err)) return;
	  });

    this.setState({removeFriendSuggestionId: undefined});
  }

  cardSuggestionCancel = () => {
    this.setState({removeSuggestionId: undefined});
  }

  cardSuggestionYes = () => {
	const config =
	{
		headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
	}

    for (let i = 0; i < this.state.cardSuggestions.length; i++) {
      if (this.state.cardSuggestions[i].id === this.state.removeSuggestionId) {
        this.state.cards.splice(0, 0, this.state.cardSuggestions[i]);
        this.state.cardSuggestions.splice(i, 1);
        break;
      }
    }

    axios.post(`${Config.API_HOST}/trade/${this.friendid}/card/add/${this.state.removeSuggestionId}`, {}, config)
      .then(res => {
        this.load()
      }).catch(err => {
        redirectIfNecessary(this.props.history, err);
	  });

    this.setState({removeSuggestionId: undefined, tradeCount: this.state.tradeCount + 1},
      () => {this.setInfo(); this.setDisabled()});
  }

  cardSuggestionNo = () => {
	const config =
	{
		headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
	}

    for (let i = 0; i < this.state.cardSuggestions.length; i++) {
      if (this.state.cardSuggestions[i].id === this.state.removeSuggestionId) {
        this.state.cardSuggestions.splice(i, 1);
        break;
      }
    }

    axios.post(`${Config.API_HOST}/trade/${this.friendid}/suggestion/remove/${this.state.removeSuggestionId}`, {}, config)
      .then(res => {
        this.load()
      }).catch(err => {
        redirectIfNecessary(this.props.history, err);
	  });

    this.setState({removeSuggestionId: undefined});
  }

  confirm = () => {
	const config =
	{
		headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
	}

    this.setState({confirmed: 1}, this.setInfo);

    axios.post(`${Config.API_HOST}/trade/${this.friendid}/confirm`, {}, config)
      .then(res => {
        this.load();
      }).catch(err => {
    	redirectIfNecessary(this.props.history, err);
	  });
  }

  redirect = (url: string) => {
    this.props.history.push(url);
  }

  render() {

    let size = 0.8;
    if (window.screen.availWidth < 600) size = 0.7;
    if (window.screen.availWidth < 500) size = 0.6;
    if (window.screen.availWidth < 420) size = 0.5;
    if (window.screen.availWidth < 350) size = 0.4;

    return (
      <div className="trade_wrapper_parent">
        <Loading loading={this.state.loading} />
        {
          this.state.removeSuggestionId !== undefined &&
          <YesNoCancel
            disableYes={this.state.tradeCount >= this.state.tradeLimit}
            yesCallback={this.cardSuggestionYes}
            noCallback={this.cardSuggestionNo}
            cancelCallback={this.cardSuggestionCancel}
            text="Accept?"
          />
        }
        {
          this.state.removeFriendSuggestionId !== undefined &&
          <YesNo
            yesCallback={this.cardSuggestionFriendRemove}
            noCallback={this.cardSuggestionFriendCancel}
            text="Remove?"
          />
        }
        {
          this.state.removeId !== undefined &&
          <YesNo
            yesCallback={this.cardOwnRemove}
            noCallback={this.cardOwnRemoveCancel}
            text="Remove?"
          />
        }
        {
          this.state.found ? (
            <div className="trade_wrapper">
              <Card
                styleClassName="trade_own"
                title={"You " + this.state.info}
                icon={''}
                iconNum={0}
                onIconClick={function (): void {} }
                onClick={function (event: any): void {} }
              >
                <Scrollbar>
                  <div className="card_wrapper">
                    {
                      this.state.cardSuggestions !== undefined &&
                      (
                        this.state.cardSuggestions.map((card: any) => (
                          <div className="waifucard_wrapper" key={"card-" + card.id}>
                            <WaifuCard
                              card={card}
                              size={size}
                              onClick={(e: any, uuid: any) => {this.onCardSuggestionClick(e, uuid, this)}}
                              cardcolor={suggestCardColor}
                            >
                            </WaifuCard>
                          </div>
                        ))
                      )
                    }
                    {
                      this.state.cards === undefined ?
                        (
                          <div className="cards_load">
                            <WaifuCardLoad size="1">
                            </WaifuCardLoad>
                          </div>
                        ) :
                        this.state.cards.map((card: any) => (
                          <div className="waifucard_wrapper" key={"card-" + card.id}>
                            <WaifuCard
                              card={card}
                              size={size}
                              onClick={(e: any, uuid: any) => {this.onCardOwnClick(e, uuid, this)}}
                            >
                            </WaifuCard>
                          </div>
                        )
                        )
                    }
                  </div>
                </Scrollbar>
                <input
                  type="submit"
                  className="button_input"
                  value={this.state.disabled !== undefined ? this.state.disabled : "Add Card"}
                  disabled={this.state.disabled !== undefined}
                  onClick={() => {this.redirect("/tradeinventory/" + this.friendid)}}
                />
              </Card>
              <Card
                styleClassName="trade_friend"
                title={this.state.name + " " + this.state.friendinfo}
                icon={''}
                iconNum={0}
                onIconClick={function (): void {} }
                onClick={function (event: any): void {} }
              >
                <Scrollbar>
                  <div className="card_wrapper">
                    {
                      this.state.friendCardSuggestions !== undefined &&
                      (
                        this.state.friendCardSuggestions.map((card: any) => (
                          <div className="waifucard_wrapper" key={"card-" + card.id}>
                            <WaifuCard
                              card={card}
                              size={size}
                              onClick={(e: any, uuid: any) => {this.onFriendCardSuggestionClick(e, uuid, this)}}
                              cardcolor={suggestCardColor}
                            >
                            </WaifuCard>
                          </div>
                        ))
                      )
                    }
                    {
                      this.state.friendcards === undefined ?
                        (
                          <div className="cards_load">
                            <WaifuCardLoad size="1">
                            </WaifuCardLoad>
                          </div>
                        ) :
                        this.state.friendcards.map((card: any) => (
                          <div className="waifucard_wrapper" key={"card-" + card.id}>
                            <WaifuCard
                              card={card}
                              size={size}
                            >
                            </WaifuCard>
                          </div>
                        )
                        )
                    }
                  </div>
                </Scrollbar>
                <input
                  type="submit"
                  className="button_input"
                  value="Suggest Card"
                  onClick={() => {this.redirect("/suggestcard/" + this.friendid)}}
                />
              </Card>
              <input
                type="submit"
                className="button_input button_confirm"
                value={this.state.confirmdisabled == null ? "Confirm" : this.state.confirmdisabled}
                onClick={this.confirm}
                disabled={this.state.confirmdisabled !== undefined}
              />
            </div>
          ) :
            (
              <div className="trade_wrapper">
                <Card
                  styleClassName="trade_own trade_friend"
                  title="Error"
                  icon={''}
                  iconNum={0}
                  onIconClick={function (): void {} }
                  onClick={function (event: any): void {} }
                >
                  <h1>User not found</h1>
                </Card>
              </div>
            )
        }
      </div >
    );
  }
}

export default withRouter(Trade);
