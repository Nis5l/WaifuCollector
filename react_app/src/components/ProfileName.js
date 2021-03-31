import React, {useState} from 'react'
import { Tooltip } from 'reactstrap'

import "./ProfileName.scss"

function ProfileName(props) {

    return (

        <div className="profileName">
            
            <h2 className="name">{props.name}</h2>

            <div className="badges">

                <Badge 
                    img={"/assets/badges/crown.png"}
                    name="Supporter"
                />

                <Badge 
                    img={"/assets/badges/dev.jpg"}
                    name="Developer"
                />

            </div>

        </div>

    )
}

function Badge(props){

    const [tooltipOpen, setTooltipOpen] = useState(false);
    const toggle = () => setTooltipOpen(!tooltipOpen);

    const makeID = (length) => {

        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;

    }

    const[badgeID] = useState(makeID(30));

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
