import { Redirect, Route, RouteProps } from "react-router";
import useAuth from "../hooks/useAuth"

type Props = RouteProps & {
    children: any
}

const PrivateRoute = ({ children, ...rest }: Props) => {
    const { auth } = useAuth();

    return (
        <Route
            { ...rest }
            render = {() => {
                return auth != null ? (children) : ( <Redirect to="/login" /> )
            }}
        />
    );
}

export default PrivateRoute;