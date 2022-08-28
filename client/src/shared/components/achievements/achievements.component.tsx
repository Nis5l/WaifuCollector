import { Component } from 'react';

import AchievementComponent from './achievement';
import { AchievementsProps } from './types';
import ScrollbarComponent from '../../../shared/components/scrollbar'

import './achievements.component.scss';

export default class AchievementsComponent extends Component<AchievementsProps>{
	render()
	{
		this.props.achievements.reverse();
		return (
			<ScrollbarComponent>
				<ul className='achievements-inner'>
					{
						this.props.achievements.map((achievement: any) => (
							<AchievementComponent key={achievement.text} achievement={achievement}/>
						))
					}
				</ul>
			</ScrollbarComponent>
		);
	}
}
