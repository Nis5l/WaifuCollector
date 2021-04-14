import React, {Component} from 'react';
import Card from '../../components/Card';
import axios from 'axios';
import Config from '../../config.json';
import Cookies from 'js-cookie';
import WaifuCard, {parseCards, WaifuCardLoad} from '../../components/WaifuCard';

import './Trade.scss'

class Trade extends Component {

  constructor(props) {
    super(props);

    this.state =
    {
      name: "Loading...",
      cards: undefined,
      friendcards: undefined,
      found: true
    }

    this.friendid = props.match.params.id;
    this.cardfriend = React.createRef();
  }

  componentDidMount() {
    let data = {token: Cookies.get('token'), userID: this.friendid};
    axios.post(`${Config.API_HOST}/trade`, data)
      .then((res) => {
        if (res && res.status === 200 && res.data && res.data.status === 0) {
          parseCards(res.data.cards);
          parseCards(res.data.cardsfriend);
          this.setState({
            name: res.data.username,
            cards: res.data.cards,
            friendcards: res.data.cardsfriend
          });
        } else {
          this.setState({found: false});
        }
      });
  }

  render() {
    return (
      <div className="trade_wrapper_parent">
        {
          this.state.found ? (
            <div className="trade_wrapper">
              <Card
                styleClassName="trade_own"
                title="You"
              >
                <div className="card_wrapper">
                  {
                    this.state.cards === undefined ?
                      (
                        <div className="cards_load">
                          <WaifuCardLoad size="1">
                          </WaifuCardLoad>
                        </div>
                      ) :
                      this.state.cards.map((card) => (
                        <div className="waifucard_wrapper" key={card.id}>
                          <WaifuCard
                            card={card}
                            size={1}
                          >
                          </WaifuCard>
                        </div>
                      )
                      )
                  }
                </div>
                <form className="button_form">
                  <input type="button" className="button_input" value="Add Card" />
                </form>
              </Card>
              <Card
                styleClassName="trade_friend"
                title={this.state.name}
              >
                <div className="card_wrapper">
                  {
                    this.state.friendcards === undefined ?
                      (
                        <div className="cards_load">
                          <WaifuCardLoad size="1">
                          </WaifuCardLoad>
                        </div>
                      ) :
                      this.state.friendcards.map((card) => (
                        <div className="waifucard_wrapper" key={card.id}>
                          <WaifuCard
                            card={card}
                            size={1}
                          >
                          </WaifuCard>
                        </div>
                      )
                      )
                  }

                </div>
                <form className="button_form">
                  <input type="button" className="button_input" value="Suggest Card" />
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
      </div>
    );
  }
}

export default Trade;
