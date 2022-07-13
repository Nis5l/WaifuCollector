import {useState, useEffect, useCallback} from 'react'
import {Tooltip} from 'reactstrap'

import Config from '../config.json'
import axios from 'axios'

import "./ProfileName.scss"

interface Badge {
    name: string,
    asset: string
}

type Props = {
    userID: string,
    username?: string,
    badges?: Badge[] | undefined,
    lCallback: () => void
}

function ProfileName(props: Props) {

    const [username, setUsername] = useState(props.username);
    const [badges, setBadges] = useState([] as Badge[]);

    let lcounter = 0;
    let lcounterMax = 2;
    if (props.username != null && props.username !== username && props.username !== "") {
        setUsername(props.username);
    }

    
    const incrementLCounter = useCallback(() => {
        lcounter++;
        if (lcounter === lcounterMax && props.lCallback) props.lCallback();
    }, [lcounter, lcounterMax, props]);

    useEffect(() => {
        if (props.userID == null) return;
        if (props.username != null && props.username !== ""){ incrementLCounter(); return; }

        let isMounted: boolean = true;
        axios.get(`${Config.API_HOST}/user/${props.userID}/username`)
            .then(res => {
                if(isMounted) setUsername(res.data.username);
				incrementLCounter();
            }).catch(err => {
				console.log("Unexpected /user/:id/username error");
			});

        return () => { isMounted = false; }
    }, [setUsername, props.userID, props.username, incrementLCounter]);

    useEffect(() => {
        let isMounted: boolean = true;

        async function getBadges(userID: string) {

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

            if(isMounted)setBadges(badges);
            incrementLCounter();
        }

        loadBadges();
        return () => { isMounted = false; }
    }, [setBadges, props.userID, props.badges, incrementLCounter]);

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
