import {useState} from 'react'
import { useNavigate } from 'react-router-dom';
import DoneIcon from '@material-ui/icons/Done';

import {timeSince} from '../../../Utils'
import { NotificationProps } from './types';

export default function NotificationComponent(props: NotificationProps) {
    const fadingTime = 0.2;
    const [fading, setFading] = useState(false);
    const timesince = timeSince(new Date(props.notification.time))//TODO: check if right;
    const navigate = useNavigate();

    const done = () => {
        if (props.onHide) props.onHide();
    }

    const remove = () => {
        setFading(true);
        setTimeout(() => {
            if (props.onRemove) props.onRemove(props.notification.id);
        }, fadingTime * 1000);
    }

    let classNames = "notification";

    if (!props.icon)
        classNames += " noIcon";

    return (

        <div
            className={classNames}
            onClick={() => {
                done();
                remove();
                navigate("/" + props.notification.url);
            }}
            style={{animation: fading ? `fadeout ${fadingTime}s forwards` : "none"}}
        >

            {props.icon &&

                <div className="icon">
                    <img src={props.icon} alt="icon" />
                </div>

            }

            <div className="not_content">

                <h2>{props.notification.message}</h2>
                <p>{timesince}</p>

            </div>

            <div className="doneButton">

                <DoneIcon onClick={
                    (e) => {
                        remove();
                        e.stopPropagation();
                    }}
                />
            </div>
        </div>
    );
}
