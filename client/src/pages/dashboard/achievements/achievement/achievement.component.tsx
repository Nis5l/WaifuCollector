import { Component } from 'react';

import type { AchievementProps } from './types';
import Config from '../../../../config.json';

import './achievement.component.scss';

export class AchievementComponent extends Component<AchievementProps> {
    render() {
        return (
            <li
                className="achievement"
            >
                <img
                    src={`${Config.API_HOST}/achievements/${this.props.achievement.image}`}
                    alt="Achievement"
                />
                <p>{this.props.achievement.text}</p>
            </li>
        )
    }
}
