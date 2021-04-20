import React, {Component} from 'react';
import Card from '../../components/Card';
import axios from 'axios';
import Config from '../../config.json';
import Cookies from 'js-cookie';
import WaifuCard, {parseCards, WaifuCardLoad} from '../../components/WaifuCard';
import Scrollbar from '../../components/ScrollBar';
import {YesNo, YesNoCancel} from '../../components/Popup';

import './Trade.scss'

const suggestCardColor = "rgb(255 255 255 / 50%)";

class Trade extends Component {

  constructor(props) {
    super(props);

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

      removeId: undefined,
      removeFriendSuggestionId: undefined,
      removeSuggestionId: undefined,

      disabled: undefined
    }

    this.friendid = props.match.params.id;
    this.cardfriend = React.createRef();
  }

  componentDidMount() {
    const data = {token: Cookies.get('token'), userID: this.friendid};
    axios.post(`${Config.API_HOST}/trade`, data)
      .then((res) => {
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
            friendCardSuggestions: res.data.cardsuggestionsfriend
          }, this.setInfo);

          this.setInfo();

          this.setDisabled();
        } else {
          this.setState({found: false});
        }
      });
  }

  setInfo() {
    this.setState({
      info: this.state.tradeCount + "/" + this.state.tradeLimit,
      friendinfo: this.state.friendTradeCount + "/" + this.state.tradeLimit,
    });
  }

  setDisabled() {
    if (this.tradeCount1 >= this.tradeLimit) {
      this.setState({disabled: "Cardlimit Reached"});
      return;
    }
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
    this.setState({removeId: undefined, tradeCount: this.state.tradeCount - 1}, this.setInfo);

    axios.post(`${Config.API_HOST}/removetrade`, data);
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

    for (let i = 0; i < this.state.cards.length; i++) {
      if (this.state.friendCardSuggestions[i].id === this.state.removeFriendSuggestionId) {
        this.state.friendCardSuggestions.splice(i, 1);
        break;
      }
    }
    this.setState({removeFriendSuggestionId: undefined});

    axios.post(`${Config.API_HOST}/removesuggestion`, data);
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

    this.setState({removeSuggestionId: undefined, tradeCount: this.state.tradeCount + 1}, this.setInfo);

    axios.post(`${Config.API_HOST}/acceptsuggestion`, data);
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

    axios.post(`${Config.API_HOST}/removesuggestion`, data);
  }

  render() {
    return (
      <div className="trade_wrapper_parent">
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
                              size={0.8}
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
                              size={0.8}
                              onClick={(e, uuid) => {this.onCardOwnClick(e, uuid, this)}}
                            >
                            </WaifuCard>
                          </div>
                        )
                        )
                    }
                  </div>
                </Scrollbar>
                <form className="button_form" action={"/tradeinventory/" + this.friendid} method="GET">
                  <input
                    type="submit"
                    className="button_input"
                    value={this.state.disabled !== undefined ? this.state.disabled : "Add Card"}
                    disabled={this.state.disabled !== undefined}
                  />
                </form>
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
                              size={0.8}
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
                              size={0.8}
                            >
                            </WaifuCard>
                          </div>
                        )
                        )
                    }
                  </div>
                </Scrollbar>
                <form className="button_form" action={"/suggestcard/" + this.friendid} method="GET">
                  <input
                    type="submit"
                    className="button_input"
                    value="Suggest Card" />
                </form>
              </Card>
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

export default Trade;
