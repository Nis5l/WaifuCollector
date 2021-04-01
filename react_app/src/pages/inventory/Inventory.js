import React, {Component} from 'react'
import axios from 'axios'
import Cookies from 'js-cookie';
import WaifuCard, {parseCards} from '../../components/WaifuCard';

import "./Inventory.scss"
import Config from '../../config.json'

class Inventory extends Component {
  constructor(props) {
    super();
    this.props = props;

    this.card_wrapper = React.createRef();
    this.state =
    {
      cards: []
    };
  }

  isBottom(el) {
    return el.getBoundingClientRect().bottom <= window.innerHeight;
  }

  componentDidMount() {
    document.addEventListener('scroll', this.trackScrolling);
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.trackScrolling);
  }

  trackScrolling = () => {
    if (this.card_wrapper == null) return;
    if (this.isBottom(this.card_wrapper)) {
      axios.post(`${Config.API_HOST}/inventory`, {token: Cookies.get("token"), page: 0})
        .then(res => {
          if (res && res.status === 200) {
            if (res.data && res.data.status === 0) {
              parseCards(res.data.inventory);
              this.setState({cards: [...this.state.cards, ...res.data.inventory]});
              console.log(this.state.cards);
            }
          }
        });
    }
  };

  render() {
    return (
      <div className="inventory_wrapper">
        <div ref={(el) => {this.card_wrapper = el; this.trackScrolling();}} className="card_wrapper">
          {
            this.state.cards.map((card) => (
              <div className="inventory_card_wrapper">
                <WaifuCard
                  key={card.id}
                  uuid={card.id}
                  cardid={card.card.id}
                  typeid={card.card.type.id}
                  img={card.card.cardImage}
                  framefront={card.card.frame.path_front}
                  frameback={card.card.frame.path_back}
                  effect={card.card.effect}
                  cardname={card.card.cardName}
                  animename={card.card.type.name}
                  size="1"
                  quality={card.quality}
                  level={card.level}
                  effectopacity="0.5"
                  cardcolor="transparent"
                  clickable="false"
                >
                </WaifuCard>
              </div>
            ))
          }
        </div>
      </div>
    );
  }
}

export default Inventory;
