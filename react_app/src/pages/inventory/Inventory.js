import React, {Component} from 'react'
import axios from 'axios'
import Cookies from 'js-cookie';
import WaifuCard, {parseCards} from '../../components/WaifuCard';
import InfiniteScroll from 'react-infinite-scroller';
import Select from 'react-select'

import "./Inventory.scss"
import Config from '../../config.json'

class Inventory extends Component {
  constructor(props) {
    super();
    this.props = props;

    this.card_wrapper = React.createRef();
    this.key = 0;
    this.scrollpadding = 500;
    this.state =
    {
      cards: [],
      hasMore: true
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
      data = {token: Cookies.get("token"), page: 0, search: search, sortType: sortType};
    else
      data = {token: Cookies.get("token"), next: 0};
    axios.post(`${Config.API_HOST}/inventory`, data)
      .then(res => {
        if (res && res.status === 200) {
          if (res.data && res.data.status === 0) {
            parseCards(res.data.inventory);
            let cards = [...this.state.cards, ...res.data.inventory];
            this.key = 0;
            this.setState({cards: cards});
            if (res.data.page === res.data.pagemax) {
              this.setState({hasMore: false});
            }
          }
        }
      });
  }

  onFilter(e, obj) {
    if (e !== undefined) e.preventDefault();
    obj.key = 0;
    obj.setState({cards: [], hasMore: true});
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
