import React, {lazy, Suspense, useState} from 'react'
import Card from '../../components/Card'
import Loading from '../../components/Loading'

import PackGraph from '../../components/PackGraph'
import Foldable from '../../components/Foldable'
import Scrollbar from '../../components/ScrollBar'

import "./Home.scss"
import "../../scss/effects.scss"

import Config from '../../config.json'

const WaifuCard = lazy(() => import('../../components/WaifuCard'));

const loading = () => <p>Loading...</p>

function Home() {

    const [loadingState, setLoadingState] = useState(true);

    return (

        <Scrollbar>
            <Loading loading={loadingState} />
            <div className="container_home">
                <Card
                    title="Packs Opened"
                    styleClassName="packGraphWrapper"
                    icon={''}
                    iconNum={0}
                    onIconClick={function (): void {} }
                    onClick={function (event: any): void {} }
                >
                    <PackGraph styleClassName="packGraph" onLoad={() => {setLoadingState(false)}} />
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
                                img={`/assets/card/Card_Ichigo.webp`}
                                framefront={`/assets/card/Frame_Silver_Front.png`}
                                frameback={`/assets/card/Frame_Silver_Back.png`}
                                effect={`/assets/card/Effect2.gif`}
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
                        title={''}
                        icon={''}
                        iconNum={0}
                        onIconClick={function (): void {} }
                        onClick={function (event: any): void {} }
                    >
                        <div>
                            <div>
								<a
									href="https://discord.gg/hftNUqNgRj"
									target="_blank"
									rel="noreferrer"
								>
									<img className="shake" src="/assets/discordicon.png" alt="Discord" />
								</a>
							</div>
                            <div>
								<a
									href="https://github.com/Nis5l/WaifuCollector"
									target="_blank"
									rel="noreferrer"
								>
									<img className="shake" src="/assets/giticon.png" alt="Discord" />
								</a>
							</div>
                            <div id="privacyhref">
								<a href="/privacy" className="shake">Privacy</a>
							</div>
                        </div>
                    </Card>
                </div>
            </div >
        </Scrollbar>
    )
}

export default Home
