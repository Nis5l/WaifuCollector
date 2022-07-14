import { Component } from 'react';

import { AchievementComponent } from './achievement';
import { AchievementsProps } from './types';
import { Scrollbar } from '../../../../shared'

import './achievements.component.scss';

export class AchievementsComponent extends Component<AchievementsProps>{
	render()
	{
		this.props.achievements.reverse();
		return (
			<Scrollbar>
				<ul className='achievements-inner'>
					{
						this.props.achievements.map((achievement: any) => (
							<AchievementComponent key={achievement.text} achievement={achievement}/>
						))
					}
				</ul>
			</Scrollbar>
		);
	}
}
