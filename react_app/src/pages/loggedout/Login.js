import React, {useState} from 'react'
import Card from '../../components/Card'

import "./Login.scss"

function Login(props) {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    function validateForm(){

        return (username.length > 0) && (password.length > 0);

    }

    function handleSubmit(event){

        event.preventDefault();

        props.setToken("123");

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
