import { Notification } from './notification';

export interface NotificationProps {
    icon: string,
	notification: Notification,
    onHide: () => void,
    onRemove: (id: string) => void
};
