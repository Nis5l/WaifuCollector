import React, {useState} from 'react'
import { Tooltip } from 'reactstrap'

import "./ProfileName.scss"

function ProfileName(props) {

    return (

        <div className="profileName">
            
            <h2 className="name">{props.name}</h2>

            <div className="badges">

                <Badge 
                    img={"/assets/badges/donaldPepe.png"}
                    name="Donald Pepe"
                />

                <Badge 
                    img={"/assets/badges/crown.png"}
                    name="Supporter"
                />

                <Badge 
                    img={"/assets/badges/dev.png"}
                    name="Developer"
                />

            </div>

        </div>

    )
}

function Badge(props){

    const [tooltipOpen, setTooltipOpen] = useState(false);
    const toggle = () => setTooltipOpen(!tooltipOpen);

    const badgeID = (`badge_${props.name}`).replaceAll(" ", "_");

    return(

        <div className="badge">

            <img src={props.img} alt={props.name} id={badgeID}/>
            <Tooltip placement="bottom" isOpen={tooltipOpen} target={badgeID} toggle={toggle}>
                {props.name}
            </Tooltip>

    </div>

    );

}

export default ProfileName
