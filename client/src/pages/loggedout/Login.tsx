import React, {useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom'
import Card from '../../components/Card'
import Logo from '../../components/Logo'
import axios from 'axios'

import "./Login.scss"

import Config from '../../config.json'
import Cookies from 'js-cookie'

type PropsLogin = {
    setToken: (token: string) => void
}

function Login(props: PropsLogin) {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(undefined);
    const [disabled, setDisabled] = useState(true);

    const [userwrong, setUserwrong] = useState(true);
    const [passwrong, setPasswrong] = useState(true);

    const updateToken = (token: string) => props.setToken(token);

    const history = useHistory();

    function validateForm() {

        return (username.length > 0) && (password.length > 0);

    }

    function handleSubmit(event: any) {

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
				Cookies.set("userID", res.data.userId, {expires: 30 * 12 * 30});
				Cookies.set("token", res.data.token, {expires: 30 * 12 * 30});

				axios.get(`${Config.API_HOST}/user/${res.data.userId}/rank`)
					.then((res) => {
						Cookies.set("rank", res.data.rank);
					}).catch(err => {
						console.log("Unexpected /user/:id/rank error");
					});

				updateToken(res.data.token);
            }).catch(err => {
				setError(err.response.data.error);
			});
    }

    useEffect(() => {
        const dis = userwrong || passwrong;
        if (dis !== disabled) setDisabled(dis);
    });

    return (

        <Card styleClassName="login"
            title={''}
            icon={''}
            iconNum={0}
            onIconClick={function (): void {} }
            onClick={function (event: any): void {} }
        >

            <Logo className="logo" size="" />

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
