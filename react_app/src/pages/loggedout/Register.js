import React, { useState } from 'react';
import { useHistory } from "react-router-dom";
import Card from '../../components/Card';

import axios from 'axios';
import Config from '../../config.json';

import "./Register.scss"

function Register(props){

    const history = useHistory();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");

    function validateForm() {

        return true;

    }

    function handleSubmit(event) {

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

                console.log(res);

                if (res && res.status === 200) {

                    if (res.data && res.data.status === 0) {

                        history.push("/login");
                        return;

                    }

                }

                console.log("Error registering!");

            });

    }

    return (

        <Card styleClassName="register">

            <img
                src="/assets/Icon.png"
                alt="Logo"
                className="logo"
            ></img>

            <form onSubmit={handleSubmit}>

                <div>

                    <input type="text" className="text_input" name="username" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <input type="email" className="text_input" name="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" className="text_input" name="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <input type="password" className="text_input" name="passwordRepeat" placeholder="Repeat password" value={passwordRepeat} onChange={(e) => setPasswordRepeat(e.target.value)} />

                </div>

                <input type="submit" name="submit" value="Register" />

            </form>

        </Card>

    );

}

export default Register