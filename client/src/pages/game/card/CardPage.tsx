import React, {Component, RefObject} from 'react'
import WaifuCard, {parseCards, WaifuCardLoad} from '../../../components/WaifuCard'
import InfiniteScroll from 'react-infinite-scroller'
import {YesNo} from '../../../components/Popup'
import Scrollbar from '../../../components/ScrollBar'
import redirectIfNecessary from '../../../components/Redirecter'
import Loading from '../../../components/Loading'

import Config from '../../../config.json'

import './CardPage.scss'
import { AxiosPrivateProps } from '../../../hooks/useAxiosPrivate'
import { AuthProps } from '../../../hooks/useAuth'
import { ReactRouterProps, withRouter } from '../../../hooks/withRouter'

type PropsCardPage = ReactRouterProps & AuthProps & AxiosPrivateProps & {
  history: any
}

type StateCardPage = {
  mainwaifucard: any | undefined,
  maincard: any | undefined,
  cards: any[] | undefined,
  hasMore: boolean,
  upgradeId: number | undefined,
  focus: boolean,
  upgradeSuccess: undefined,
  upgradeColor: string | undefined,
  loading: boolean
}

class CardPage extends Component<PropsCardPage, StateCardPage> {
  private mainuuid: number = 0;
  
  private key: number;
  private page: number;

  private lCounter: number;
  private lCounterMax: number;

  private loadingCards: boolean;

  private card_wrapper: RefObject<any>;

  constructor(props: PropsCardPage) {
    super(props);
    if(props.router.params.id != null){
      this.mainuuid = parseInt(props.router.params.id);
    }

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
    this.props.axios.get(`/card/${this.mainuuid}`)
      .then((res: any) => {
        if (redirectIfNecessary(this.props.history, res.data)) return;
        this.incrementLCounter();
        parseCards([res.data]);
        this.setState({maincard: res.data});
      }).catch((err: any) => {
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

    this.props.axios.post(`/user/${this.props.auth.id}/inventory`, data)
      .then((res: any) => {
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
      }).catch((err: any) => {
          redirectIfNecessary(this.props.history, err);
	  });
  }

  onCardClick = (e: any, uuid: number) => {
    this.setState({upgradeId: uuid});
  }

  upgradeCallback = () => {
    if(this.state.cards == null) return;

    for (let i = 0; i < this.state.cards.length; i++) {
      if (this.state.cards[i].id === this.state.upgradeId) {
        this.state.cards.splice(i, 1);
        break;
      }
    }

    this.state.mainwaifucard.startUpgradeEffect();
    this.state.mainwaifucard.focusCard();

    let data ={
      cardOne: this.mainuuid,
      cardTwo: this.state.upgradeId
    }

    this.setState({upgradeId: undefined, focus: true});

    let newcard: any = undefined;
    let success: any = undefined;

    this.props.axios.post(`${Config.API_HOST}/card/upgrade`, data)
      .then((res: any) => {
        success = res.data.success;
       this.props.axios.get(`${Config.API_HOST}/card/${res.data.card}`)
          .then((res: any) => {
            parseCards([res.data]);
            newcard = res.data;
          }).catch((err: any) => {
            this.setState({maincard: -1});
          });
        }).catch((err: any) => {
          redirectIfNecessary(this.props.history, err);
        });

    let startTimeout = (time: number) => {
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
              onCreate={(obj: any) => {this.setState({mainwaifucard: obj})}}
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
