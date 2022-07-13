
import { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import { AuthProps, withAuth } from "../../hooks/useAuth";
import ProfileImage from "../users/ProfileImage";
import "./Navigation.scss"

const navprefix: string = "nav-";

type PropsNavigation = AuthProps & {}

class Navigation extends Component<PropsNavigation>{

    render(): ReactNode {
        return (
            <div className={navprefix + "wrapper"}>
                <div
                    className={navprefix + "title"}
                >
                    <Link
                        to="/"
                    >
                        <img
                            src="/assets/IconWhite.png"
                            className="headerIcon"
                            alt="Icon"
                        />

                        <span>WaifuCollector</span>
                    </Link>
                </div>
                <div className="gap"></div>
                <div className={navprefix + "links"}>
                    { this.props.auth != null && (
                        <>
                            <Link
                                to="/collectors"
                            >Collectors</Link>
                            <ProfileImage
                                className={"profile"}
                                userID={this.props.auth.id}
                            />
                            <Link
                                to="/logout"
                            >Logout</Link>
                        </>
                    ) }
                    { this.props.auth == null && (
                        <>
                            <Link
                                to="/register"
                            >Register</Link>
                            <LoginButton />
                        </>
                    ) }
                </div>
            </div>
        )
    }
}

function LoginButton(){
    return (
        <Link
            to="/login"
            className={navprefix + "login"}
        >
            Login
        </Link>
    )
}

export default withAuth(Navigation);