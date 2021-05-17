import React from 'react'
import Card from '../../components/Card'

import DoneIcon from '@material-ui/icons/Done';
import {timeSince} from '../../Utils'

import "./Notifications.scss"

function Notification(props){

    const timesince = timeSince(props.date);

    const done = () => {

        console.log("delete");

    }

    let classNames = "notification";

    if(!props.icon)
        classNames += " noIcon";

    return (
    
        <div className={classNames}>

            {props.icon && 

            <div className="icon">
                <img src={props.icon} alt="icon" />
            </div>
            
            }

            <div className="not_content">

                <h2>{props.message}</h2>
                <p>{timesince}</p>

            </div>

            <div className="doneButton">

                <DoneIcon onClick={done} />

            </div>

        </div>
        
    );

}

export default function Notifications() {

    const now = new Date();

    const hardCodedDate = new Date("Mon, 17 May 2021 17:30:10 GMT");
    const lastYearFromNow = new Date().setFullYear(now.getFullYear() -1);
    const yearFromNow = new Date().setFullYear(now.getFullYear() +1);

    return (
        <Card
          title="Notifications"
          styleClassName="notifications_container"
        >

            <Notification
                message="New friend request from Haselnusse"
                date={hardCodedDate}
                icon="/assets/IconColor.png"
            />

            <Notification
                message="New friend request from Haselnusse"
                date={now}
                icon="/assets/IconColor.png"
            />

            <Notification
                message="New friend request from Haselnusse"
                date={lastYearFromNow}
                icon=""
            />

            <Notification
                message="WaifuCollector developer receives Nobel Peace Prize!"
                date={yearFromNow}
                icon=""
            />
            
        </Card>
    )
}
