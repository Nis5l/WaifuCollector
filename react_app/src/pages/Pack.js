import React from 'react'
import WaifuCard from "../components/WaifuCard"

import './Pack.scss'

function Pack() {
    return (
        <div className="container_pack">

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
                <div className="packcard">
                    <WaifuCard
                        img="http://127.0.0.1:10001/Card/Card_Ichigo.jpg"
                        framefront="http://127.0.0.1:10001/Frame/Frame_Silver_Front.png"
                        frameback="http://127.0.0.1:10001/Frame/Frame_Silver_Back.png"
                        effect="http://127.0.0.1:10001/Effect/Effect2.gif"
                        cardname="Ichigo"
                        animename="Darling In The FranXX"
                        size="1"
                        quality="Y"
                        level="X"
                        effectopacity="0.5"
                        cardcolor="transparent"
                        turned="true"
                    >
                    </WaifuCard>
                </div>
            </div>
        </div>
    );
}

export default Pack;
