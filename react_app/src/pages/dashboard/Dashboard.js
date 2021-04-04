import Cookies from 'js-cookie'
import React, {useState, useEffect} from 'react'
import Card from '../../components/Card'
import Friendlist from '../../components/Friendlist'
import PackProgressRing from '../../components/PackProgressRing'
import ProfileName from '../../components/ProfileName'

import "./Dashboard.scss"

function Dashboard() {

    const [userID, setUserID] = useState(Cookies.get('userID'));

    useEffect(() => {

        if (userID === undefined)
            setUserID(Cookies.get('userID'));

    }, [setUserID, userID]);

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

                <Friendlist
                    userID={userID}
                />

            </Card>

        </div>

    )
}

export default Dashboard
