
import Config from "../../config.json";

import "./ProfileImage.scss"

export type PropsProfileImage = {
    userID: string,
    className?: any
}

function ProfileImage(props: PropsProfileImage){
    return (
        <div className={"profile_image " + (props.className != null ? props.className : "")}>
            <img
                src={`${Config.API_HOST}/user/${props.userID}/avatar`}
                alt="Avatar"
            />
        </div>
    )
}

export default ProfileImage;