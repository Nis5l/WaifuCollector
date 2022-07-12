import {useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom'
import Card from '../../components/Card'
import Logo from '../../components/Logo'

import "./Login.scss"

import User from '../../shared/User'
import useAuth from '../../hooks/useAuth'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import { setRememberMe } from '../../utils/utils'

type PropsLogin = {}

function Login(props: PropsLogin) {

    const { setAuth } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);

    const [error, setError] = useState(undefined);
    const [disabled, setDisabled] = useState(true);

    const [userwrong, setUserwrong] = useState(true);
    const [passwrong, setPasswrong] = useState(true);

    const history = useHistory();

    const axios = useAxiosPrivate();

    function validateForm() {
        return (username.length > 0) && (password.length > 0);
    }

    function handleSubmit(event: any) {
        setError(undefined);

        event.preventDefault();

        if (!validateForm())
            return;

        const user = {
            username: username,
            password: password
        };

        axios.post(`/login`, user)
            .then(res => {
                const userId: string = res.data.userId;
                const username: string = res.data.username;
                const role: number = res.data.role;
                const token: string = res.data.accessToken;

                const user: User = { id: userId, username, role, token };

                setAuth(user);

                setRememberMe(remember);

                history.push("/dashboard");
            }).catch(err => {
				setError(err.response.data.error);
			});
    }

    useEffect(() => {
        const dis = userwrong || passwrong;
        if (dis !== disabled) setDisabled(dis);
    }, [disabled, passwrong, userwrong]);

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

                <label>
                    <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} />
                    Remember Me
                </label>

                <input className="button_input" type="submit" name="submit" value="Login" disabled={disabled} />

            </form>

        </Card>
    )
}

export default Login;
