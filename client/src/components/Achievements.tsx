import { Component } from 'react';

import Scrollbar from './ScrollBar'
import Config from '../config.json'

import './Achievements.scss';

type PropsAchievements = {
	achievements: any
}

export default class Achievements extends Component<PropsAchievements>{
	render()
	{
		this.props.achievements.reverse();
		return (
			<Scrollbar>
				<ul className='achievements-inner'>
					{
						this.props.achievements.map((achievement: any) => (
							<Achievement key={achievement.text} achievement={achievement}/>
						))
					}
				</ul>
			</Scrollbar>
		);
	}
}

type PropsAchievement = {
	achievement: any
}

class Achievement extends Component<PropsAchievement> {
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
