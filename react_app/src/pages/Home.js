import React from 'react'
import Card from '../components/Card'
import PackGraph from '../components/PackGraph'

import "./Home.scss"

function Home() {
    return (

        <div className="container_home">

            <Card
                title="Packs Opened"
                styleClassName="packGraphWrapper"
            >
                <PackGraph
                    styleClassName="packGraph"
                />
            </Card>

        </div>

    )
}

export default Home
