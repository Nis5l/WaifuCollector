import { AxiosPrivateProps } from '../../../hooks/useAxiosPrivate'
import { AuthProps } from '../../../hooks/useAuth'
import { ReactRouterProps } from '../../../hooks/withRouter'

export interface ProfileProps extends ReactRouterProps, AxiosPrivateProps, AuthProps {}
