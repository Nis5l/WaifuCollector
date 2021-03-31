import React from 'react'
import Card from '../components/Card'
import PackGraph from '../components/PackGraph'
import Foldable from '../components/Foldable'
import WaifuCard from '../components/WaifuCard'

import "./Home.scss"

function Home() {
    return (

        <div className="container_home">
            <Card
                title="Packs Opened"
                styleClassName="packGraphWrapper"
            >
                <PackGraph styleClassName="packGraph" />
            </Card>

            <Foldable
                title="Tutorial"
                styleClassName="tutorial"
            >
                <h5>Packs</h5>
                <p>In this game you can collect, upgrade and trade Waifu-Cards.</p>
                <p>Every 30 minutes you can pull a Waifu-Card.</p>
                <p>Waifu-Cards starts with Level 1 and a Quality from 1-5.</p>
                <p>X: Level, Y: Quality</p>
                <div>
                    <WaifuCard
                        img="http://127.0.0.1:10001/Card/Card_Ichigo.jpg"
                        framefront="http://127.0.0.1:10001/Frame/Frame_Silver_Front.png"
                        frameback="http://127.0.0.1:10001/Frame/Frame_Silver_Back.png"
                        effect="http://127.0.0.1:10001/Effect/Effect2.gif"
                        cardname="Ichigo"
                        animename="Darling In The FranXX"
                        size="0.8"
                        quality="Y"
                        level="X"
                        effectopacity="0.5"
                        cardcolor="transparent"
                        clickable="false"
                    >
                    </WaifuCard>
                </div>
                <h5>Upgrading</h5>
                <p>By Combining 2 Cards of the same Character and Level you can Upgrade them.</p>
                <p>The Chance for the Upgrade to succeede in %:<br />(Quality1 + Quality2) * 10.</p>
                <p>If the Upgrade succeedes:<br />
                    &emsp;Level will incremented by one.<br />
                    &emsp;Quality will be random from 1-5.
                </p>
                <p>If the Upgrade fails:<br />
                    &emsp;Level will stay the same<br />
                    &emsp;Quality will be the avarage of the two plus 1.
                </p>

                <h5>Trading</h5>
                <p>You can trade with your friends.<br />
                    You can add and suggest Waifu-Cards when trading.<br />
                    When both Users hit accept the Trade is complete.</p>
            </Foldable>
            <Foldable
                title="Copyright"
                styleClassName="copyright"
            >
                <p style={{paddingTop: "10px"}}>If you have any copyright related issues please contact me.<br />
                    (contact.waifucollector@gmail.com).</p>
                <p>I will happily resolve the issue.</p>
                <p>Everything is nonprofit, so I would be thankful if we could solve the problems without any sort of legal process.</p>
            </Foldable>
            <Card
                styleClassName="privacy"
            >
                <div>
                    <a
                        id="discordhrefwrapper"
                        href="https://discord.gg/hftNUqNgRj"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <img id="discordhref" src="/assets/discordicon.png" alt="Discord" />
                    </a>
                    <a href="/privacy" id="privacyhref">Privacy</a>
                </div>
            </Card>
        </div >

    )
}

export default Home
