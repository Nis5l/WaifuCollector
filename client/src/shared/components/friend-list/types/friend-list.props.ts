import { AxiosPrivateProps } from '../../../../hooks/useAxiosPrivate'
import { ReactRouterProps } from '../../../../hooks/withRouter'

export interface FriendListProps extends ReactRouterProps, AxiosPrivateProps {
    userID: string,
    requests?: boolean,
    onFriendRequests?: (len: number) => void,
    onFriendData?: (friends: any[]) => void,
    decrementRequests?: () => void,
    lCallback?: () => void
}
