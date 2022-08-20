import { AxiosPrivateProps } from '../../../../hooks/useAxiosPrivate'
import { ReactRouterProps } from '../../../../hooks/withRouter';

export interface PackProgressRingProps extends ReactRouterProps, AxiosPrivateProps {
    collectorID: string;
    className: string;
    lCallback: () => void;
}
