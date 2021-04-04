import React, {useState, useEffect} from 'react'

import axios from 'axios'
import Config from '../config.json'

import './Friendlist.scss'
import ProfileName from './ProfileName'

function Friendlist(props) {

    const [friends, setFriends] = useState([]);

    useEffect(() => {

        async function loadFriends() { 

            const data = await axios.post(Config.API_HOST + "/friends", { id: props.userID});
    
            if(data.data.status !== 0)
                return [];
    
            return data.data.friends;
    
        }

        async function fetchData(){

            let friends = await loadFriends();

            // STATUS == 1 => ACCEPTED ??? IDK LION HÄÄÄÄÄÄÄÄLLLLLPPPP
            const filteredFriends = friends.filter((friend) => friend.status === 1);

            setFriends(filteredFriends);

        }

        fetchData();

    }, [props.userID]);

    if(props.userID === undefined)
        return(<div className="friendslist"></div>);

    return (

        <div
            className="friendslist"
        >

            <ul>

                {friends.map((friend) => {

                    return (

                        <Friend
                            key={friend.userID}
                            avatar="/assets/Icon.png"
                            userID={friend.userID}
                        />

                    )

                })}

            </ul>

        </div>
        
    )
}

function Friend(props) {

    return (

        <li className="friend">

            <img src={props.avatar} alt="Friend Avatar" />

            <ProfileName
                userID={props.userID}
            />

        </li>

    )

}

export default Friendlist
