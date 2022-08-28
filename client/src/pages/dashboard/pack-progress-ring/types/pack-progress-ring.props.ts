import type { ReactRouterProps, AxiosPrivateProps } from '../../../../hooks'

export interface PackProgressRingProps extends ReactRouterProps, AxiosPrivateProps {
    collectorID: string;
    className: string;
    lCallback: () => void;
}
