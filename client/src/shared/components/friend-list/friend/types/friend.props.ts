import { ReactRouterProps } from '../../../../../hooks/withRouter'

export interface FriendProps extends ReactRouterProps {
    userID: string;
    username: string;
    status: number;
    avatar: string;
    onDelete?: (userID: string, username: string) => void;
    onAccept?: (userID: string) => void;
    onDecline?: (userID: string) => void;
}

