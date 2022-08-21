import type { GameCard } from '../shared/types';
import Config from '../config.json';

const rememberme: string = "rememberme";

export function setRememberMe(value: boolean): void{
    localStorage.setItem(rememberme, value ? "true" : "false");
}

export function getRememberMe(): boolean{
    return localStorage.getItem(rememberme) === "true";
}

export function removeRememberMe(): void{
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

export function parseCards(cards: GameCard[]) {
    for (let i = 0; i < cards.length; i++) {
        cards[i].cardInfo.image = `${Config.API_HOST}/${cards[i].cardInfo.image}`;
        cards[i].cardFrame.front = `${Config.API_HOST}/${cards[i].cardFrame.front}`;
        cards[i].cardFrame.back = `${Config.API_HOST}/${cards[i].cardFrame.back}`;
        if (cards[i].cardEffect.image != null)
            cards[i].cardEffect.image = `${Config.API_HOST}/${cards[i].cardEffect.image}`;
    }
}
