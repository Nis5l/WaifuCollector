import React, {Component} from 'react'
import Card from '../../components/Card'
import axios from 'axios'
import Config from '../../config.json'
import Cookies from 'js-cookie'
import WaifuCard, {parseCards, WaifuCardLoad} from '../../components/WaifuCard'
import Scrollbar from '../../components/ScrollBar'
import {YesNo, YesNoCancel} from '../../components/Popup'
import {withRouter} from 'react-router-dom'
import RefreshButton from '../../components/RefreshButton'
import redirectIfNecessary from '../../components/Redirecter'
import Loading from '../../components/Loading'
import {formatTime} from '../../Utils'

import './Trade.scss'

const suggestCardColor = "rgb(255 255 255 / 50%)";

class Trade extends Component {

  constructor(props) {
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

  load() {
    const data = {token: Cookies.get('token'), userID: this.friendid};
    axios.post(`${Config.API_HOST}/trade`, data)
      .then((res) => {

        if (redirectIfNecessary(this.props.history, res.data)) return;
        this.incrementLCounter();

        if (res && res.status === 200 && res.data && res.data.status === 0) {

          parseCards(res.data.cards);
          parseCards(res.data.cardsfriend);
          parseCards(res.data.cardsuggestions);
          parseCards(res.data.cardsuggestionsfriend);

          this.tradeCount1 = res.data.tradeCount1;
          this.tradeLimit = res.data.tradeLimit;

          this.setState({
            name: res.data.username,
            cards: res.data.cards,
            friendcards: res.data.cardsfriend,
            tradeCount: res.data.tradeCount1,
            friendTradeCount: res.data.tradeCount2,
            tradeLimit: res.data.tradeLimit,
            cardSuggestions: res.data.cardsuggestions,
            friendCardSuggestions: res.data.cardsuggestionsfriend,
            confirmed: res.data.statusone,
            friendConfirmed: res.data.statustwo,
            tradeTime: res.data.tradeTime
          }, () => {this.setInfo(); this.setDisabled()});

          if (res.data.tradeTime !== 0) {
            let interval = this.timeinterval = setInterval(() => {
              let newtime = this.state.tradeTime - 1000;
              if (newtime < 0) newtime = 0;
              this.setState({tradeTime: newtime}, this.setDisabled)

              if (newtime === 0) clearInterval(interval);
            }, 1000)
          }

        } else {
          this.setState({found: false});
        }
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

  onCardOwnClick(e, uuid, self) {
    self.setState({removeId: uuid});
  }

  onFriendCardSuggestionClick(e, uuid, self) {
    self.setState({removeFriendSuggestionId: uuid});
  }

  onCardSuggestionClick(e, uuid, self) {
    self.setState({removeSuggestionId: uuid});
  }

  cardOwnRemove = () => {
    const data = {token: Cookies.get('token'), userID: this.friendid, cardID: this.state.removeId};

    for (let i = 0; i < this.state.cards.length; i++) {
      if (this.state.cards[i].id === this.state.removeId) {
        this.state.cards.splice(i, 1);
        break;
      }
    }
    this.setState({removeId: undefined, tradeCount: this.state.tradeCount - 1, confirmed: 0, friendConfirmed: 0},
      () => {this.setInfo(); this.setDisabled()});

    axios.post(`${Config.API_HOST}/removetrade`, data)
      .then((res) => {
        this.load()
      });
  }

  cardOwnRemoveCancel = () => {
    this.setState({removeId: undefined});
  }

  cardSuggestionFriendCancel = () => {
    this.setState({removeFriendSuggestionId: undefined});
  }

  cardSuggestionFriendRemove = () => {
    const data = {
      token: Cookies.get('token'),
      userID: this.friendid,
      cardID: this.state.removeFriendSuggestionId,
      friend: true
    }

    for (let i = 0; i < this.state.friendCardSuggestions.length; i++) {
      if (this.state.friendCardSuggestions[i].id === this.state.removeFriendSuggestionId) {
        this.state.friendCardSuggestions.splice(i, 1);
        break;
      }
    }
    this.setState({removeFriendSuggestionId: undefined});

    axios.post(`${Config.API_HOST}/removesuggestion`, data)
      .then((res) => {
        if (redirectIfNecessary(this.props.history, res.data)) return;
        this.load()
      });
  }

  cardSuggestionCancel = () => {
    this.setState({removeSuggestionId: undefined});
  }

  cardSuggestionYes = () => {
    const data = {
      token: Cookies.get('token'),
      userID: this.friendid,
      cardID: this.state.removeSuggestionId
    }

    for (let i = 0; i < this.state.cardSuggestions.length; i++) {
      if (this.state.cardSuggestions[i].id === this.state.removeSuggestionId) {
        this.state.cards.splice(0, 0, this.state.cardSuggestions[i]);
        this.state.cardSuggestions.splice(i, 1);
        break;
      }
    }

    this.setState({removeSuggestionId: undefined, tradeCount: this.state.tradeCount + 1},
      () => {this.setInfo(); this.setDisabled()});

    axios.post(`${Config.API_HOST}/acceptsuggestion`, data)
      .then((res) => {
        if (redirectIfNecessary(this.props.history, res.data)) return;
        this.load()
      });
  }

  cardSuggestionNo = () => {
    const data = {
      token: Cookies.get('token'),
      userID: this.friendid,
      cardID: this.state.removeSuggestionId
    }

    for (let i = 0; i < this.state.cardSuggestions.length; i++) {
      if (this.state.cardSuggestions[i].id === this.state.removeSuggestionId) {
        this.state.cardSuggestions.splice(i, 1);
        break;
      }
    }

    this.setState({removeSuggestionId: undefined});

    axios.post(`${Config.API_HOST}/removesuggestion`, data)
      .then((res) => {
        if (redirectIfNecessary(this.props.history, res.data)) return;
        this.load()
      });
  }

  confirm = () => {
    const data = {
      token: Cookies.get('token'),
      userID: this.friendid
    }

    this.setState({confirmed: 1}, this.setInfo);

    axios.post(`${Config.API_HOST}/okTrade`, data)
      .then((res) => {

        if (redirectIfNecessary(this.props.history, res.data)) return;

        this.load();
      })
  }

  redirect = (url) => {
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
              >
                <Scrollbar>
                  <div className="card_wrapper">
                    {
                      this.state.cardSuggestions !== undefined &&
                      (
                        this.state.cardSuggestions.map((card) => (
                          <div className="waifucard_wrapper" key={"card-" + card.id}>
                            <WaifuCard
                              card={card}
                              size={size}
                              onClick={(e, uuid) => {this.onCardSuggestionClick(e, uuid, this)}}
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
                        this.state.cards.map((card) => (
                          <div className="waifucard_wrapper" key={"card-" + card.id}>
                            <WaifuCard
                              card={card}
                              size={size}
                              onClick={(e, uuid) => {this.onCardOwnClick(e, uuid, this)}}
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
              >
                <Scrollbar>
                  <div className="card_wrapper">
                    {
                      this.state.friendCardSuggestions !== undefined &&
                      (
                        this.state.friendCardSuggestions.map((card) => (
                          <div className="waifucard_wrapper" key={"card-" + card.id}>
                            <WaifuCard
                              card={card}
                              size={size}
                              onClick={(e, uuid) => {this.onFriendCardSuggestionClick(e, uuid, this)}}
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
                        this.state.friendcards.map((card) => (
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
                value={this.state.confirmdisabled === undefined ? "Confirm" : this.state.confirmdisabled}
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
