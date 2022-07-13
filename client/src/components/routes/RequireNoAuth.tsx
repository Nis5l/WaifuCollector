import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth"

const RequireNoAuth = () => {
    const { auth } = useAuth();

    return (
        auth == null
            ? <Outlet />
            : <Navigate to="/dashboard" />
    );
}

export default RequireNoAuth;