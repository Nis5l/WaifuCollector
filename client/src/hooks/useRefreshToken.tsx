import axios from "../api/axios";
import User from "../shared/User";
import useAuth from "./useAuth";

const useRefreshToken = () => {
    const { setAuth } = useAuth();

    let refreshing: boolean = false;
    let promise: Promise<string> | undefined = undefined;

    const refresh = async () => {
        if(!refreshing){
            refreshing = true;
            console.log("refreshing");
            promise = new Promise(async (resolve, reject) => {
                let ret = undefined;
                try{
                    const response = await axios.get("/refresh");
                    setAuth((prev: User) => {
                        return { ...prev, role: response.data.role, token: response.data.accessToken };
                    });
                    ret = response.data.accessToken;
                }catch(err){
                    setAuth(undefined);
                }
                refreshing = false;
                console.log("refreshed");
                resolve(ret);
            });
        }
        return await promise;
    }
    return refresh;
};

export default useRefreshToken;