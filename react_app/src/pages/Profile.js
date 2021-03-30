import React from 'react'
import Card from '../components/Card'
import PackProgressRing from '../components/PackProgressRing'
import ProfileName from '../components/ProfileName'

import "./Profile.scss"

function Profile(props) {

    const id = props.match.params.id;

    if(!Number.isInteger(parseInt(id, 10))){

        return(
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
                        name={props.match.params.id}
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

            <ProfileName
                name={props.name}
            />

        </li>

    )

}

export default Profile
