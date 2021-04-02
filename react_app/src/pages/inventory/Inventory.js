import React, {Component} from 'react'
import axios from 'axios'
import Cookies from 'js-cookie';
import WaifuCard, {parseCards} from '../../components/WaifuCard';
import InfiniteScroll from 'react-infinite-scroller';

import "./Inventory.scss"
import Config from '../../config.json'

class Inventory extends Component {
  constructor(props) {
    super();
    this.props = props;

    this.card_wrapper = React.createRef();
    this.key = 0;
    this.loading = false;
    this.scrollpadding = 500;
    this.state =
    {
      cards: []
    };
  }

  trackScrolling = () => {
    if (this.card_wrapper == null) return;
    this.loading = true;
    let data;
    if (this.key === 0)
      data = {token: Cookies.get("token"), page: 0};
    else
      data = {token: Cookies.get("token"), next: 0};
    axios.post(`${Config.API_HOST}/inventory`, data)
      .then(res => {
        if (res && res.status === 200) {
          if (res.data && res.data.status === 0) {
            parseCards(res.data.inventory);
            this.key = 0;
            this.setState({cards: [...this.state.cards, ...res.data.inventory]});
            this.loading = false;
          }
        }
      });
  }

  render() {
    return (
      <div className="inventory_wrapper">
        <div
          className="card_wrapper"
        >
          <InfiniteScroll
            pageStart={0}
            loadMore={this.trackScrolling}
            hasMore={true || false}
            className="card_wrapper"
            useWindow={false}
          >
            {
              this.state.cards.map((card) => (
                < div className="inventory_card_wrapper" key={"card-" + this.key++}>
                  <WaifuCard
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
          </InfiniteScroll>
        </div>
      </div>
    );
  }
}

export default Inventory;
