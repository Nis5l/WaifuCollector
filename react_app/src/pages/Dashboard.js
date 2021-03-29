import React, { Component } from 'react'
import Card from '../components/Card'

import "./Dashboard.scss"

function Dashboard() {
    return (

        <div className="container">

            <Card
                title="Account Info"
                styleClassName="accountInfo"
            >
                
                <div className="avatar">

                    <img src="/assets/Icon.png" alt="Avatar" />

                </div>

                <h1 className="profileName">SmallCode</h1>

                <table className="stats">

                    <tbody>

                        <tr>

                            <td>Friends:</td>
                            <td>15/50</td>

                        </tr>

                        <tr>

                            <td>Waifus:</td>
                            <td>256/280</td>

                        </tr>

                        <tr>

                            <td>Trades:</td>
                            <td>3/3</td>

                        </tr>

                    </tbody>

                </table>

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
                
                <ul>

                    <Friend
                        avatar="/assets/Icon.png"
                        name="SmallCode"
                    />
                    <Friend
                        avatar="/assets/Icon.png"
                        name="SmallCode"
                    />
                    <Friend
                        avatar="/assets/Icon.png"
                        name="SmallCode"
                    />
                    <Friend
                        avatar="/assets/Icon.png"
                        name="SmallCode"
                    />
                    <Friend
                        avatar="/assets/Icon.png"
                        name="SmallCode"
                    />
                    <Friend
                        avatar="/assets/Icon.png"
                        name="SmallCode"
                    />
                    <Friend
                        avatar="/assets/Icon.png"
                        name="SmallCode"
                    />
                    <Friend
                        avatar="/assets/Icon.png"
                        name="SmallCode"
                    />
                                        <Friend
                        avatar="/assets/Icon.png"
                        name="SmallCode"
                    />
                                        <Friend
                        avatar="/assets/Icon.png"
                        name="SmallCode"
                    />
                                        <Friend
                        avatar="/assets/Icon.png"
                        name="SmallCode"
                    />
                                        <Friend
                        avatar="/assets/Icon.png"
                        name="SmallCode"
                    />
                                        <Friend
                        avatar="/assets/Icon.png"
                        name="SmallCode"
                    />
                                        <Friend
                        avatar="/assets/Icon.png"
                        name="SmallCode"
                    />
                                        <Friend
                        avatar="/assets/Icon.png"
                        name="SmallCode"
                    />
                                        <Friend
                        avatar="/assets/Icon.png"
                        name="SmallCode"
                    />

                </ul>

            </Card>

        </div>

    )
}

function Friend(props){

    return(

        <li className="friend">

            <img src={props.avatar} alt="Friend Avatar" />

            <p>{props.name}</p>

        </li>

    )

}

export default Dashboard
