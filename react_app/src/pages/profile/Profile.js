import React from 'react'
import Card from '../../components/Card'
import Friendlist from '../../components/Friendlist'
import ProfileName from '../../components/ProfileName'

import "./Profile.scss"

function Profile(props) {

    const userID = props.match.params.id;

    if (!Number.isInteger(parseInt(userID, 10))) {

        return (
            <h1>Invalid this id is!</h1>
        );

    }

    return (

        <div className="container_profile">

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
                title="Flex flex"
                styleClassName="flexen"
            >

                <div className="flex-grid">

                    

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

export default Profile
