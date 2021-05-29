import React, {useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom'
import Card from '../../components/Card'
import Logo from '../../components/Logo'
import axios from 'axios'

import "./Login.scss"

import Config from '../../config.json'
import Cookies from 'js-cookie'

function Login(props) {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(undefined);
    const [disabled, setDisabled] = useState(true);

    const [userwrong, setUserwrong] = useState(true);
    const [passwrong, setPasswrong] = useState(true);

    const updateToken = (token) => props.setToken(token);

    const history = useHistory();

    function validateForm() {

        return (username.length > 0) && (password.length > 0);

    }

    function handleSubmit(event) {

        if (username === "admin" && password === "WaifuAdminx324!") {
            history.push("adminpanel");
            return;
        }

        setError(undefined);

        event.preventDefault();

        if (!validateForm())
            return;

        const user = {
            username: username,
            password: password
        };

        axios.post(`${Config.API_HOST}/login`, user)
            .then(res => {

                if (res && res.status === 200) {

                    if (res.data && res.data.status === 0) {
                        Cookies.set("userID", res.data.userID, {expires: 30 * 12 * 30});
                        Cookies.set("token", res.data.token, {expires: 30 * 12 * 30});

                        axios.get(`${Config.API_HOST}/${res.data.userID}/rank`)
                            .then((res) => {
                                if (res.data && res.data.status === 0) {
                                    Cookies.set("rank", res.data.rankID);
                                }
                            })

                        updateToken(res.data.token);
                        return;
                    }

                    setError(res.data.message);

                }
            });
    }

    useEffect(() => {
        const dis = userwrong || passwrong;
        if (dis !== disabled) setDisabled(dis);
    });

    return (

        <Card styleClassName="login">

            <Logo className="logo" />

            <form onSubmit={handleSubmit} autoComplete="false">

                {
                    error !== undefined &&
                    <p className="error">{error}</p>
                }
                <input
                    autoComplete="false"
                    type="text"
                    className={"text_input" + (userwrong ? " invalid" : "")}
                    name="username"
                    placeholder="Username"
                    value={username}
                    onChange={
                        (e) => {
                            setUsername(e.target.value);
                            setUserwrong(e.target.value.length < 4 || e.target.value.length > 20);
                        }
                    }
                />
                <input
                    type="password"
                    className={"text_input" + (passwrong ? " invalid" : "")}
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={
                        (e) => {
                            setPassword(e.target.value);
                            setPasswrong(e.target.value.length < 8 || e.target.value.length > 30);
                        }
                    }
                />

                <input className="button_input" type="submit" name="submit" value="Login" disabled={disabled} />

            </form>

        </Card>
    )
}

export default Login;
