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
                        img="http://192.168.1.40:10001/Card/Card_Ichigo.jpg"
                        framefront="http://192.168.1.40:10001/Frame/Frame_Silver_Front.png"
                        frameback="http://192.168.1.40:10001/Frame/Frame_Silver_Back.png"
                        effect="http://192.168.1.40:10001/Effect/Effect2.gif"
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
                <p>By Combining 2 Cards of the same Character and Level you can Upgrade them.
				<br />The Chance for the Upgrade to succeede in % is (Quality1 + Quality2) * 10.</p>
                <p>If the Upgrade succeedes the new Cards Level will be one higher and the Quality will be random from 1-5.
				<br />If the Upgrade fails the new Cards Level will stay the same, and the Quality will be the avarage of the two plus 1.</p>

                <h5>Trading</h5>
                <p>You can add Waifu-Cards to the Trade and when both Users hit accept the Trade is complete.</p>
            </Foldable>
            <Foldable
                title="Copyright"
                styleClassName="copyright"
            >
                <p>If you have any copyright related issues please contact me (contact.waifucollector@gmail.com), I will happily resolve the issue.</p>
                <p>Everything is nonprofit, so I would be thankful if we could solve the problems together without any sort of legal process.</p>
            </Foldable>

        </div >

    )
}

export default Home
