import React, {useState, useEffect} from 'react'
import {Tooltip} from 'reactstrap'

import Config from '../config.json'
import axios from 'axios'

import "./ProfileName.scss"

function ProfileName(props) {

    const [username, setUsername] = useState(props.username);
    const [badges, setBadges] = useState([]);

    let lcounter = 0;
    let lcounterMax = 2;

    if (props.username !== undefined && props.username !== username) {
        setUsername(props.username);
    }

    useEffect(() => {

        if (props.userID === undefined) return;

        if (props.username !== undefined) return;
        axios.get(`${Config.API_HOST}/user/${props.userID}`)
            .then((res) => {
                if (res && res.status === 200) {
                    if (res && res.data && res.data.status === 0) {
                        setUsername(res.data.username);
                        incrementLCounter();
                    }
                }

            });

    }, [setUsername, props.userID]);

    function incrementLCounter() {
        lcounter++;
        if (lcounter === lcounterMax && props.lCallback) props.lCallback();
    }

    useEffect(() => {

        async function getBadges(userID) {

            if (props.badges) return props.badges;

            const data = await axios.get(Config.API_HOST + `/user/${userID}/badges`);

            if (data.data.status === 0) {

                return data.data.badges;

            }

            return [];

        }

        async function loadBadges() {

            const badges = await getBadges(props.userID);

            setBadges(badges);
            incrementLCounter();

        }

        loadBadges();

    }, [setBadges, props.userID]);

    return (

        <div className="profileName">

            <a href={`/profile/${props.userID}`} className="name">{username}</a>

            <div className="badges">
                {
                    badges.map((badge) => {

                        let badgeImage = Config.API_HOST + badge.asset;

                        return (
                            <Badge
                                key={makeID(30)}
                                img={badgeImage}
                                name={badge.name}
                            />
                        )
                    })

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
export {Badge};
