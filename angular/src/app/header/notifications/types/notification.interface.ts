
import type { Id } from '../../../types';

export interface Notification{
	id: Id,
	user_id: Id,
	title: string,
	message: string,
	url: string,
	time: Date
}
