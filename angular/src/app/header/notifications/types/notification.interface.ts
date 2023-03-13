import type { Id } from '../../../shared/types';

export interface Notification {
	id: Id,
	user_id: Id,
	title: string,
	message: string,
	url: string,
	time: Date
}
