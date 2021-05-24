import React, {Component} from 'react'
import ResizeText from "./ResizeText"
import {LoopCircleLoading} from 'react-loadingg'
import {withRouter} from 'react-router-dom'

import Config from '../config.json'

import './WaifuCard.scss'

class WaifuCard extends Component {
    constructor(props) {
        super(props);

        this.init(props);

        this.upgradeEffectDelay = 100;
        this.upgradeEffect = undefined;
        this.upgradeEffectSize = 1.2;
        this.effectSymbols = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    }

    init(props) {
        this.props = props;

        let level = "X";
        let quality = "Y";
        let uuid = undefined;
        let cardid = undefined;
        let typeid = undefined;
        let img = undefined;
        let framefront = undefined;
        let frameback = undefined;
        let effect = undefined;
        let cardname = undefined;
        let animename = undefined;
        let effectopacity = undefined;

        if (props.card !== undefined) {
            let card = props.card;

            uuid = card.id;
            cardid = card.card.id;
            typeid = card.anime.id;
            img = card.card.image;
            framefront = card.frame.front;
            frameback = card.frame.back;
            effect = card.effect.image;
            cardname = card.card.name;
            animename = card.anime.name;
            quality = card.quality;
            level = card.level;
            effectopacity = card.effect.opacity;
        } else {
            uuid = props.uuid;
            cardid = props.cardid;
            typeid = props.typeid;
            img = props.img;
            framefront = props.framefront;
            frameback = props.frameback;
            effect = props.effect;
            cardname = props.cardname;
            animename = props.animename;
            quality = props.quality;
            level = props.level;
            effectopacity = props.effectopacity;
        }

        if (effectopacity === 0) effect = undefined;

        let size = parseFloat(props.size);
        let cardcolor = props.cardcolor;
        let identifier = props.identifier;
        let clickable = props.clickable === "false" ? false : true;
        let redirects = props.redirects === "true" ? true : false;

        this.onClick = props.onClick;
        this.onCreate = this.props.onCreate;

        this.onturn = props.onturn;
        this.onturndata = props.onturndata;

        /*
         * WARNING INTENDED
         */
        if (this.state === undefined)
            this.state =
            {
                turned: this.props.turned === "true",
                level: level,
                quality: quality,
                uuid: uuid,
                cardid: cardid,
                typeid: typeid,
                img: img,
                framefront: framefront,
                frameback: frameback,
                effect: effect,
                cardname: cardname,
                animename: animename,
                effectopacity: effectopacity,
                size: size,
                cardcolor: cardcolor,
                identifier: identifier,
                clickable: clickable,
                redirects: redirects,

                sizemult: 1,
                focus: false,
                upgrading: false
            };
        else
            this.setState({
                turned: this.props.turned === "true",
                level: level,
                quality: quality,
                uuid: uuid,
                cardid: cardid,
                typeid: typeid,
                img: img,
                framefront: framefront,
                frameback: frameback,
                effect: effect,
                cardname: cardname,
                animename: animename,
                effectopacity: effectopacity,
                size: size,
                cardcolor: cardcolor,
                identifier: identifier,
                clickable: clickable,
                redirects: redirects,
            });
    }

    onTurn(e, self) {
        if (this.onturn !== undefined) this.onturn(e, self.state.uuid, this.onturndata);
        this.setState({turned: false});

        if (this.onClick !== undefined) this.onClick(e, self.state.uuid);

        if (this.state.redirects) self.redirect(self);
    }

    redirect(self) {
        if (self === undefined) self = this;
        self.props.history.push(`/card/${this.state.uuid}`)
    }

    componentDidMount() {
        if (this.onCreate) this.onCreate(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.card && nextProps.card.id !== undefined &&
            this.state !== undefined &&
            nextProps.card.id !== this.state.uuid) {
            this.init(nextProps);
            return true;
        }

        return nextState.turned !== this.state.turned ||
            nextState.level !== this.state.level ||
            nextState.quality !== this.state.quality ||
            nextState.uuid !== this.state.uuid ||
            nextState.clickable !== this.state.clickable ||
            nextState.focus !== this.state.focus ||
            nextState.sizemult !== this.state.sizemult ||
            nextState.cardcolor !== this.state.cardcolor ||
            nextState.upgrading !== this.state.upgrading ||
            nextState.redirects !== this.state.redirects;
    }

    startUpgradeEffect() {
        if (this.upgradeEffect !== undefined) return;

        this.setState({cardcolor: "#ffffffff", upgrading: true});

        this.upgradeEffect = setInterval(() => {
            if (this.upgradeEffect === undefined) return;
            const idx = Math.floor(Math.random() * (this.effectSymbols.length + 1));
            const idx2 = Math.floor(Math.random() * (this.effectSymbols.length + 1));
            this.setState({level: this.effectSymbols[idx], quality: this.effectSymbols[idx2]});
        }, this.upgradeEffectDelay)

    }

    focusCard() {
        this.setState({focus: true, sizemult: this.upgradeEffectSize});
    }

    unFocusCard() {
        this.setState({focus: false, sizemult: 1});
    }

    endUpgradeEffect() {
        this.setState({cardcolor: "transparent", upgrading: false});
        if (this.upgradeEffect !== undefined) clearInterval(this.upgradeEffect);
        this.upgradeEffect = undefined;
    }

    componentWillUnmount() {
        if (this.upgradeEffect !== undefined) clearInterval(this.upgradeEffect);
    }

    setClickable(b) {
        if (b !== true && b !== false) b = true;
        this.setState({clickable: b});
    }

    render(props, ref) {
        return (
            < div
                className={this.state.focus ? "waifucard waifucard_upgrade" : "waifucard"}
                onClick={(e) => {this.onTurn(e, this)}
                }
                style={{
                    cursor: `${this.state.clickable === true ? "pointer" : "default"}`,
                    width: `${WaifuCard.DEFWIDTH * this.state.size * this.state.sizemult}px`,
                    height: `${WaifuCard.DEFHEIGTH * this.state.size * this.state.sizemult}px`,
                    zIndex: `${this.state.focus ? "1011" : "unset"}`
                }}
            >
                <div
                    className="waifucard-inner"
                    style={{
                        backgroundImage: `url(${this.state.img})`,
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`
                    }}
                />
                <div
                    className="waifucard-effect"
                    style={{
                        backgroundImage: `url(${this.state.effect})`,
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`,
                        opacity: `${this.state.effectopacity}`,
                        animation: `${this.state.focus ? "bigpulseinputshadow 4s ease-out infinite" : "unset"}`
                    }}
                />
                <div
                    className="waifucard-color"
                    style={{
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`,
                        backgroundColor: `${this.state.cardcolor}`,
                        transition: `${this.state.upgrading === true
                            ? "background-color linear 2.3s" :
                            "background-color linear 0.5s"}`
                    }}
                />
                <div
                    className="waifucard-framefront"
                    style={{
                        backgroundImage: `url(${this.state.framefront})`,
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`
                    }}
                />
                <div
                    className="waifucard-frameback"
                    style={{
                        backgroundImage: `url(${this.state.frameback})`,
                        transform: `rotateY(${this.state.turned ? 0 : 180}deg)`
                    }}
                />
                <div
                    className="waifucard-name"
                    style={{
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`,
                    }}
                >
                    <ResizeText center={true}>
                        {this.state.cardname}
                    </ResizeText>
                </div>
                <div
                    className="waifucard-anime"
                    style={{
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`,
                    }}
                >
                    <ResizeText center={true}>
                        {this.state.animename}
                    </ResizeText>
                </div>
                <div
                    className="waifucard-quality"
                    style={{
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`,
                        fontSize: `${WaifuCard.DEFFONT * this.state.size * this.state.sizemult}px`
                    }}
                >
                    {this.state.quality}
                </div>
                <div
                    className="waifucard-level"
                    style={{
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`,
                        fontSize: `${WaifuCard.DEFFONT * this.state.size * this.state.sizemult}px`
                    }}
                >
                    {this.state.level}
                </div>
            </div >
        );
    }
}
WaifuCard.DEFWIDTH = 253;
WaifuCard.DEFHEIGTH = 365;
WaifuCard.DEFFONT = 50;

function parseCardsOld(cards) {
    for (let i = 0; i < cards.length; i++) {
        cards[i].card.cardImage = `${Config.API_HOST}/${cards[i].card.cardImage}`;
        cards[i].card.frame.path_front = `${Config.API_HOST}/${cards[i].card.frame.path_front}`;
        cards[i].card.frame.path_back = `${Config.API_HOST}/${cards[i].card.frame.path_back}`;
        if (cards[i].card.effect != null)
            cards[i].card.effect = `${Config.API_HOST}/${cards[i].card.effect}`;
    }
}

function parseCards(cards) {
    for (let i = 0; i < cards.length; i++) {
        cards[i].card.image = `${Config.API_HOST}/${cards[i].card.image}`;
        cards[i].frame.front = `${Config.API_HOST}/${cards[i].frame.front}`;
        cards[i].frame.back = `${Config.API_HOST}/${cards[i].frame.back}`;
        if (cards[i].effect.image != null)
            cards[i].effect.image = `${Config.API_HOST}/${cards[i].effect.image}`;
    }
}

class WaifuCardLoad extends Component {
    constructor(props) {
        super();
        this.state =
        {
            size: props.size
        }
    }

    render() {
        return (
            <div className="waifucard_load"
                style=
                {{
                    width: `${WaifuCard.DEFWIDTH * this.state.size}px`,
                    height: `${WaifuCard.DEFHEIGTH * this.state.size}px`,
                }}
            >
                <LoopCircleLoading
                    color="#d8d8d8" />
            </div>
        )
    }
}

export default withRouter(WaifuCard);
export {parseCards, WaifuCardLoad};
