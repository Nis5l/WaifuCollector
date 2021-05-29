import React, {useState, useEffect} from 'react';
import {useHistory} from "react-router-dom";
import Card from '../../components/Card';
import Logo from '../../components/Logo';
import {checkMail} from '../../Utils'

import axios from 'axios';
import Config from '../../config.json';

import "./Register.scss"

function Register(props) {

    const history = useHistory();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");

    const [userwrong, setUserwrong] = useState(true);
    const [mailwrong, setMailwrong] = useState(true);
    const [passwrong, setPasswrong] = useState(true);
    const [passrepwrong, setPassrepwrong] = useState(true);

    const [disabled, setDisabled] = useState(true);

    const [error, setError] = useState(undefined);

    function validateForm() {

        return true;

    }

    function handleSubmit(event) {

        setError(undefined);

        event.preventDefault();

        if (!validateForm())
            return;

        const user = {

            username: username,
            password: password,
            mail: email

        };

        axios.post(`${Config.API_HOST}/register`, user)
            .then(res => {

                if (res && res.status === 200) {

                    if (res.data && res.data.status === 0) {

                        history.push("/login");
                        return;

                    }

                    setError(res.data.message);

                }

            });

    }

    useEffect(() => {
        const dis = userwrong || passwrong || mailwrong || passrepwrong;
        if (dis !== disabled) setDisabled(dis);
    });

    return (

        <Card styleClassName="register">

            <Logo className="logo" />

            <form onSubmit={handleSubmit}>

                {
                    error !== undefined &&
                    <p className="error">{error}</p>
                }

                <input
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
                    type="email"
                    className={"text_input" + (mailwrong ? " invalid" : "")}
                    name="email"
                    placeholder="E-Mail"
                    value={email}
                    onChange={
                        (e) => {
                            setEmail(e.target.value);
                            setMailwrong(checkMail(e.target.value));
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
                            setPassrepwrong(e.target.value !== passwordRepeat);
                        }
                    }
                />

                <input
                    type="password"
                    className={"text_input" + (passrepwrong ? " invalid" : "")}
                    name="passwordRepeat"
                    placeholder="Repeat password"
                    value={passwordRepeat}
                    onChange={
                        (e) => {
                            setPasswordRepeat(e.target.value);
                            setPassrepwrong(e.target.value !== password);
                        }
                    }
                />

                <input className="button_input" type="submit" name="submit" value="Register" disabled={disabled} />

            </form>

        </Card>

    );

}

export default Register
