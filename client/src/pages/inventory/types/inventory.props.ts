import { AuthProps } from '../../../hooks/useAuth'
import { AxiosPrivateProps } from '../../../hooks/useAxiosPrivate'
import { ReactRouterProps } from '../../../hooks/withRouter'

export interface InventoryProps extends ReactRouterProps, AuthProps, AxiosPrivateProps {
  userID: string;
  friendID?: string;
  excludeSuggestions?: boolean;
  redirect?: boolean;
  loading?: boolean;
  onCardClick?: (e: any, card: any) => void;
}
