import {useState, useEffect} from 'react'
import {Tooltip} from 'reactstrap'

import Config from '../config.json'
import axios from 'axios'

import "./ProfileName.scss"

interface Badge {
    name: string,
    asset: string
}

type Props = {
    userID: number,
    username: string,
    badges: Badge[] | undefined,
    lCallback: () => void
}

function ProfileName(props: Props) {

    const [username, setUsername] = useState(props.username);
    const [badges, setBadges] = useState([] as Badge[]);

    let lcounter = 0;
    let lcounterMax = 2;
    if (props.username != null && props.username != username && props.username != "") {
        setUsername(props.username);
    }

    useEffect(() => {
        if (props.userID == null) return;
        if (props.username != null && props.username != ""){ incrementLCounter(); return; }
        axios.get(`${Config.API_HOST}/user/${props.userID}/username`)
            .then(res => {
				setUsername(res.data.username);
				incrementLCounter();
            }).catch(err => {
				console.log("Unexpected /user/:id/username error");
			});

    }, [setUsername, props.userID]);

    function incrementLCounter() {
        lcounter++;
        if (lcounter === lcounterMax && props.lCallback) props.lCallback();
    }

    useEffect(() => {

        async function getBadges(userID: number) {

            if (props.badges) return props.badges;

			try {
				const res = await axios.get(Config.API_HOST + `/user/${userID}/badges`);
                return res.data.badges;
			} catch (err) {
				return [];
			}
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

function makeID(length: number): string {

    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;

}

type PropsBadge = {
    img: string,
    name: string
}

function Badge(props: PropsBadge) {

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
