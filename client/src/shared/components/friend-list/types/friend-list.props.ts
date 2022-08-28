import type { AxiosPrivateProps, ReactRouterProps } from '../../../../hooks'

export interface FriendListProps extends ReactRouterProps, AxiosPrivateProps {
    userID: string,
    requests?: boolean,
    onFriendRequests?: (len: number) => void,
    onFriendData?: (friends: any[]) => void,
    decrementRequests?: () => void,
    lCallback?: () => void
}
