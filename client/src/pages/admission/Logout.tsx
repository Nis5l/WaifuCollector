import { useEffect, useState } from "react";
import { Redirect } from "react-router";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

function LogOut() {
    const axios = useAxiosPrivate();
    const { setAuth } = useAuth();

    const[ loggedOut, setLoggedOut ] = useState(false);

    useEffect(() => {
        axios.post("/logout", {}).then(() => {
            setLoggedOut(true);
            setAuth(undefined);
        });
    }, [ axios, setLoggedOut, setAuth ]);
  
    return (
        <>
            { loggedOut ? (<Redirect to="/"/>) : (<></>) }
        </>
    );
  
}

export default LogOut;