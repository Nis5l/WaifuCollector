import { AxiosPrivateProps } from '../../../hooks/useAxiosPrivate'
import { ReactRouterProps } from '../../../hooks/withRouter';

export interface NotificationsProps extends ReactRouterProps, AxiosPrivateProps {
    onNotifications: (notifications: any) => void,
    onHide: () => void
}
