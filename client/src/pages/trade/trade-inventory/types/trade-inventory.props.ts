import { AxiosPrivateProps } from '../../../../hooks/useAxiosPrivate'
import { AuthProps } from '../../../../hooks/useAuth'
import { ReactRouterProps } from '../../../../hooks/withRouter'

export interface TradeInventoryProps extends ReactRouterProps, AxiosPrivateProps, AuthProps {}
