import { AxiosPrivateProps } from '../../../hooks/useAxiosPrivate'
import { ReactRouterProps } from '../../../hooks/withRouter'

export interface PackProps extends ReactRouterProps, AxiosPrivateProps {}
