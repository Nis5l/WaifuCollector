import { Redirect, Route, RouteProps } from "react-router";
import useAuth from "../hooks/useAuth"

type Props = RouteProps & {
    children: any,
    allowedRoles?: number[]
}

const PrivateRoute = ({ children, allowedRoles, ...rest }: Props) => {
    const { auth } = useAuth();
    if(allowedRoles == null) allowedRoles = [];
    const roles: number[] = allowedRoles;
    
    const shouldCheckforRoles: boolean = roles.length !== 0;

    return (
        <Route
            { ...rest }
            render = {() => {
                return auth != null ? (shouldCheckforRoles ? (roles.includes(auth.role) ? children : <Redirect to="/dashboard" />) : children) : <Redirect to="/login" />
            }}
        />
    );
}

export default PrivateRoute;