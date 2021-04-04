import React, {useState, useEffect} from 'react'
import {Tooltip} from 'reactstrap'

import Config from '../config.json'
import axios from 'axios'

import "./ProfileName.scss"

function ProfileName(props) {

    const [username, setUsername] = useState("Username");
    const [badges, setBadges] = useState([]);

    useEffect(() => {

        if (props.userID === undefined)
            return;

        axios.get(`${Config.API_HOST}/user/${props.userID}`)
            .then((res) => {
                if (res && res.status === 200) {
                    if (res && res.data && res.data.status === 0) {

                        setUsername(res.data.username);

                    }
                }

            });

    }, [setUsername, props.userID]);

    useEffect(() => {
        
        async function getBadges(userID){

            const data = await axios.get(Config.API_HOST + `/user/${userID}/badges`);

            if(data.data.status === 0){

                return data.data.badges;

            }

            return [];

        }

        async function loadBadges(){

            const badges = await getBadges(props.userID);

            setBadges(badges);

        }

        loadBadges();

    }, [setBadges, props.userID]);

    return (

        <div className="profileName">

            <h2 className="name">{username}</h2>

            <div className="badges">

                {
                
                    badges.map((badge) => { return(

                        <Badge
                            key={makeID(30)}
                            img={badge.asset}
                            name={badge.name}
                        />

                    )})
                
                }

            </div>

        </div>

    )
}

function makeID(length) {

    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;

}

function Badge(props) {

    const [tooltipOpen, setTooltipOpen] = useState(false);
    const toggle = () => setTooltipOpen(!tooltipOpen);

    const [badgeID] = useState(makeID(30));

    return (

        <div className="badge">

            <img src={props.img} alt={props.name} id={badgeID} />
            <Tooltip placement="bottom" isOpen={tooltipOpen} target={badgeID} toggle={toggle}>
                {props.name}
            </Tooltip>

        </div>

    );

}

export default ProfileName
