
const rememberme: string = "rememberme";

function setRememberMe(value: boolean): void{
    localStorage.setItem(rememberme, value ? "true" : "false");
}

function getRememberMe(): boolean{
    return localStorage.getItem(rememberme) === "true";
}

function removeRememberMe(): void{
    localStorage.removeItem(rememberme);
}

export { setRememberMe, getRememberMe, removeRememberMe };