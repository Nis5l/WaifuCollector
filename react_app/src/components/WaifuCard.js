import React, {Component} from 'react'
import ResizeText from "./ResizeText"

import Config from '../config.json'

import './WaifuCard.scss'

class WaifuCard extends Component {
    constructor(props) {
        super();

        this.props = props;

        this.img = props.img;
        this.effect = props.effect;
        this.effectopacity = props.effectopacity;
        this.framefront = props.framefront;
        this.frameback = props.frameback;
        this.cardname = props.cardname;
        this.animename = props.animename;
        this.quality = props.quality;
        this.level = props.level;
        this.size = parseFloat(props.size);
        this.level = props.level;
        this.uuid = props.uuid;
        this.cardid = props.cardid;
        this.typeid = props.typeid;
        this.cardcolor = props.cardcolor;
        this.identifier = props.identifier;
        this.clickable = props.clickable === "false" ? false : true;

        this.state = {
            turned: props.turned === "true"
        }
    }

    onTurn() {
        this.setState({turned: false});
    }

    render() {
        return (
            <div
                className="waifucard"
                onClick={() => {this.onTurn()}}
                style={{
                    cursor: `${this.clickable === true ? "pointer" : "default"}`,
                    width: `${WaifuCard.DEFWIDTH * this.size}px`,
                    height: `${WaifuCard.DEFHEIGTH * this.size}px`
                }}
            >
                <div
                    className="waifucard-inner"
                    style={{
                        backgroundImage: `url(${this.img})`,
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`
                    }}
                />
                <div
                    className="waifucard-effect"
                    style={{
                        backgroundImage: `url(${this.effect})`,
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`,
                        opacity: `${this.effectopacity}`
                    }}
                />
                <div
                    className="waifucard-color"
                    style={{
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`,
                        backgroundColor: `${this.cardcolor}`,
                    }}
                />
                <div
                    className="waifucard-framefront"
                    style={{
                        backgroundImage: `url(${this.framefront})`,
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`
                    }}
                />
                <div
                    className="waifucard-frameback"
                    style={{
                        backgroundImage: `url(${this.frameback})`,
                        transform: `rotateY(${this.state.turned ? 0 : 180}deg)`
                    }}
                />
                <div
                    className="waifucard-name"
                    style={{
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`,
                    }}
                >
                    <ResizeText>
                        {this.cardname}
                    </ResizeText>
                </div>
                <div
                    className="waifucard-anime"
                    style={{
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`,
                    }}
                >
                    <ResizeText>
                        {this.animename}
                    </ResizeText>
                </div>
                <div
                    className="waifucard-quality"
                    style={{
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`,
                        fontSize: `${WaifuCard.DEFFONT * this.size}px`
                    }}
                >
                    {this.quality}
                </div>
                <div
                    className="waifucard-level"
                    style={{
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`,
                        fontSize: `${WaifuCard.DEFFONT * this.size}px`
                    }}
                >
                    {this.level}
                </div>
            </div>
        );
    }
}
WaifuCard.DEFWIDTH = 253;
WaifuCard.DEFHEIGTH = 365;
WaifuCard.DEFFONT = 50;

function parseCards(cards) {
    for (let i = 0; i < cards.length; i++) {
        cards[i].card.cardImage = `${Config.API_HOST}/${cards[i].card.cardImage}`;
        cards[i].card.frame.path_front = `${Config.API_HOST}/${cards[i].card.frame.path_front}`;
        cards[i].card.frame.path_back = `${Config.API_HOST}/${cards[i].card.frame.path_back}`;
        if (cards[i].card.effect != null)
            cards[i].card.effect = `${Config.API_HOST}/${cards[i].card.effect}`;
    }
}

export default WaifuCard;
export {parseCards};
