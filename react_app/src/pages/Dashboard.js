import React from 'react'
import Card from '../components/Card'

import "./Dashboard.scss"

function Dashboard() {
    return (

        <div className="container">

            <Card
                title="Account Info"
                styleClassName="accountInfo"
            >
                <h1>SmallCode</h1>
            </Card>

            <Card
                title="Notifications"
                styleClassName="notifications"
            >
                <h1>Notifications</h1>
            </Card>

            <Card
                title="Packs"
                styleClassName="packs"
            >
                <h1>Packs</h1>
            </Card>

            <Card
                title="Friends"
                styleClassName="friends"
            >
                <h1>Friends</h1>
            </Card>

        </div>

    )
}

export default Dashboard
