import React, {useState} from 'react'
import Card from '../../components/Card'
import axios from 'axios'

import "./Login.scss"

import Config from '../../config.json'

function Login(props) {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const updateToken = (token) => props.setToken(token);

    function validateForm(){

        return (username.length > 0) && (password.length > 0);

    }

    function handleSubmit(event){

        event.preventDefault();

        if(!validateForm())
            return;

        const user = {

            username: username,
            password: password

        };

        axios.post(`${Config.API_HOST}/login`, user)
            .then(res => {

                if(res && res.status === 200){

                    if(res.data && res.data.status === 0){

                        updateToken(res.data.token);

                    }

                }
        });

    }

    return (
        <Card styleClassName="login">
            
            <img
                src="/assets/Icon.png"
                alt="Logo"
                className="logo"
            ></img>

            <form onSubmit={handleSubmit}> 

                <div>

                    <input type="text" name="username" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}/>
                    <input type="password" name="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>

                </div>

                <input type="submit" name="submit" value="Login" />

            </form>

        </Card>
    )
}

export default Login
