import Cookies from 'js-cookie'
import React, {useState} from 'react'
import Card from '../../components/Card'
import PackProgressRing from '../../components/PackProgressRing'
import ProfileName from '../../components/ProfileName'

import "./Dashboard.scss"

function Dashboard() {

    const userID = Cookies.get('userID');

    return (

        <div className="container">

            <Card
                title="Account Info"
                styleClassName="accountInfo"
            >

                <div className="avatar">

                    <img src="/assets/Icon.png" alt="Avatar" />

                </div>

                <div className="profilename_container">

                    <ProfileName
                        userID={userID}
                    />

                </div>

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
                title="Badges"
                styleClassName="badges"
            >
                <h1>Badges</h1>
            </Card>

            <Card
                title="Packs"
                styleClassName="packs"
            >

                <div className="packs-grid">

                    <PackProgressRing className="pack1" />
                    <PackProgressRing className="pack2" />

                </div>

            </Card>

            <Card
                title="Friends"
                styleClassName="friends"
            >

                <ul>

                    <Friend
                        avatar="/assets/Icon.png"
                        name="Nissl"
                    />

                    <Friend
                        avatar="/assets/Icon.png"
                        name="haselnusse"
                    />

                </ul>

            </Card>

        </div>

    )
}

function Friend(props) {

    return (

        <li className="friend">

            <img src={props.avatar} alt="Friend Avatar" />

            <ProfileName
                name={props.name}
                userID={props.userID}
            />

        </li>

    )

}

export default Dashboard
