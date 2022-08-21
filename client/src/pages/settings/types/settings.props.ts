import { AxiosPrivateProps } from '../../../hooks/useAxiosPrivate'
import { AuthProps } from '../../../hooks/useAuth'
import { ReactRouterProps } from '../../../hooks/withRouter'

export interface SettingsProps extends ReactRouterProps, AxiosPrivateProps, AuthProps {}
