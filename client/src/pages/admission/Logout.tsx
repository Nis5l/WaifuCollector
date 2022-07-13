import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { removeRememberMe } from "../../utils/utils";

function LogOut() {
    const axios = useAxiosPrivate();
    const { setAuth } = useAuth();

    const[ loggedOut, setLoggedOut ] = useState(false);

    useEffect(() => {
        axios.post("/logout", {}).then(() => {
            setLoggedOut(true);
            setAuth(undefined);
            removeRememberMe();
        });
    }, [ axios, setLoggedOut, setAuth ]);
  
    return (
        <>
            { loggedOut ? (<Navigate to="/"/>) : (<></>) }
        </>
    );
  
}

export default LogOut;