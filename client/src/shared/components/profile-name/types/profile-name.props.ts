import type { Badge } from '../badge';

export interface ProfileNameProps {
    userID: string;
    username?: string;
    badges?: Badge[] | undefined;
    lCallback: () => void;
}
