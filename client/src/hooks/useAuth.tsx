import { useContext } from "react"
import AuthContext from "../context/AuthProvider"
import { User } from "../shared/types";

const useAuth = () => {
    return useContext(AuthContext);
}

export type AuthProps = {
    auth: User,
    setAuth: any
}

export const withAuth = (Component: any) => {
    return (props: any) => {
        const { auth, setAuth } = useAuth();

        return <Component auth={auth} setAuth={setAuth} {...props} />
    }
}

export default useAuth;
