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

export function random_string(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export { setRememberMe, getRememberMe, removeRememberMe };
