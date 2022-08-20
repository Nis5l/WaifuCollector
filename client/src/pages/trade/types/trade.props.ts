import { AuthProps } from '../../../hooks/useAuth'
import { AxiosPrivateProps } from '../../../hooks/useAxiosPrivate'
import { ReactRouterProps } from '../../../hooks/withRouter'

export interface TradeProps extends ReactRouterProps, AuthProps, AxiosPrivateProps {}
