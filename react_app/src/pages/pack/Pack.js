import React, {Component} from 'react'
import axios from 'axios'
import WaifuCard, {parseCards, WaifuCardLoad} from "../../components/WaifuCard"
import Cookies from 'js-cookie'
import {withRouter} from 'react-router-dom';

import Config from '../../config.json'

import './Pack.scss'

class Pack extends Component {
    constructor(props) {
        super();
        this.props = props;

        this.state =
        {
            cards: []
        }
    }

    componentDidMount() {
        axios.post(`${Config.API_HOST}/pack`, {token: Cookies.get('token')})
            .then((res) => {
                if (res && res.status === 200 && res && res.data && res.data.status === 0) {
                    let cards = res.data.cards;
                    parseCards(cards);
                    this.setState({cards: cards});
                } else {
                    this.props.history.push('/dashboard');
                }
            });
    }

    render() {
        return (
            <div className="container_pack" >

                <div className="packtop-wrapper">
                    <div className="packtop" />
                    <div className="packtopshadow" />
                </div>
                <div className="packbottom-wrapper">
                    <div className="packbottomshadow" />
                    <div className="packbottom" />
                </div>
                <div className="packleft-wrapper">
                    <div className="packleft" />
                    <div className="packleftshadow" />
                </div>
                <div className="packright-wrapper">
                    <div className="packright" />
                    <div className="packrightshadow" />
                </div>

                <div className="pack_card_container">
                    <div className="packtopleftcorner" />
                    <div className="packbottomrightcorner" />
                    {
                        this.state.cards.length > 0 ? this.state.cards.map((card) => (
                            <div className="packcard">
                                <WaifuCard
                                    card={card}
                                    size="1"
                                    cardcolor="transparent"
                                    clickable="true"
                                    turned="true"
                                >
                                </WaifuCard>
                            </div>
                        ))
                            :
                            (
                                <div className="pack_load">
                                    <WaifuCardLoad size="1">
                                    </WaifuCardLoad>
                                </div>
                            )
                    }
                </div>
            </div>
        );
    }
}

export default withRouter(Pack);
