import { AbstractComponent } from '../../../shared/abstract'
import AchievementComponent from './achievement';
import { AchievementsProps } from './types';
import { ScrollbarComponent } from '../../../shared/components'

import './achievements.component.scss';

export default class AchievementsComponent extends AbstractComponent<AchievementsProps>{
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
