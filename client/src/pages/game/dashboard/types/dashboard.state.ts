export interface DashboardState {
    userID: string;
    friends: number;
    maxFriends: number;
    cards: number;
    maxCards: number;
    trades: number;
    maxTrades: number;
    loading: boolean;
    friendRequests: number;
    achievements: any[];
    requests: boolean;
}
