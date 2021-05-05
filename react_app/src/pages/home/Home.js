import React, {lazy, Suspense} from 'react'
import Card from '../../components/Card'

import PackGraph from '../../components/PackGraph'
import Foldable from '../../components/Foldable'
import Scrollbar from '../../components/ScrollBar'

import "./Home.scss"
import "../../scss/effects.scss"

import Config from '../../config.json'

const WaifuCard = lazy(() => import('../../components/WaifuCard'));

const loading = () => <p>Loading...</p>

function Home() {

    return (

        <Scrollbar>
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
                        <Suspense fallback={loading()}>
                            <WaifuCard
                                img={`${Config.API_HOST}/Card/Card_Ichigo.webp`}
                                framefront={`${Config.API_HOST}/Frame/Frame_Silver_Front.png`}
                                frameback={`${Config.API_HOST}/Frame/Frame_Silver_Back.png`}
                                effect={`${Config.API_HOST}/Effect/Effect2.gif`}
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
                        </Suspense>
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
                <div className="privacy_wrapper">
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
                                <img id="discordhref" className="shake" src="/assets/discordicon.png" alt="Discord" />
                            </a>
                            <a href="/privacy" id="privacyhref" className="shake">Privacy</a>
                        </div>
                    </Card>
                </div>
            </div >
        </Scrollbar>
    )
}

export default Home
