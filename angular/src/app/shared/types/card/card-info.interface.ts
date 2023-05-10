import type { SafeResourceUrl } from '@angular/platform-browser';

import type { Id } from '../id.interface';

export interface CardInfo {
    id: Id,
    name: string,
    image: string | SafeResourceUrl
}
