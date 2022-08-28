interface User {
    userID: string,
    username: string
}

export interface FriendListState {
    friends: any[],
    friendRequests: any[],
    width: number,
    deleteUser?: User;
}
