import React, {Component} from 'react'
import axios from 'axios'
import WaifuCard, {parseCards, WaifuCardLoad} from "../../components/WaifuCard"
import Cookies from 'js-cookie'
import {withRouter} from 'react-router-dom'
import redirectIfNecessary from '../../components/Redirecter'
import Loading from '../../components/Loading'

import Config from '../../config.json'

import './Pack.scss'

class Pack extends Component {
    constructor(props) {
        super();
        this.props = props;
        this.key = 0;
        this.quitCooldown = 800;
        this.quittable = false;

        this.state =
        {
            cards: [],
            loading: true
        }
    }

    componentDidMount() {
        axios.post(`${Config.API_HOST}/pack`, {token: Cookies.get('token')})
            .then((res) => {

                if (redirectIfNecessary(this.props.history, res.data)) return;
                this.setState({loading: false});

                if (res && res.status === 200 && res && res.data && res.data.status === 0) {
                    let cards = res.data.cards;
                    parseCards(cards);
                    this.setState({cards: cards});
                } else {
                    this.props.history.push('/dashboard');
                }
            });
    }

    startQuitCooldown(e, uuid, self) {
        if (!self.quittable) {
            setTimeout(() => {
                self.quittable = true;
            }, self.quitCooldown);
        }
        else {
            self.props.history.push(`/card/${uuid}`);
            e.stopPropagation();
            e.preventDefault();
        }
    }

    onQuit(e, self) {
        if (!self.quittable) return;
        self.props.history.push('/dashboard');
        e.preventDefault();
    }

    render() {
        return (
            <div onClick={(e) => {this.onQuit(e, this)}} className="container_pack" >
                <Loading loading={this.state.loading} />

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
                            <div className="packcard" key={this.key++}>
                                <WaifuCard
                                    card={card}
                                    size="1"
                                    cardcolor="transparent"
                                    clickable="true"
                                    turned="true"
                                    onturn={this.startQuitCooldown}
                                    onturndata={this}
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
