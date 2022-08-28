import { Component } from 'react';

import Scrollbar from './ScrollBar'
import Config from '../config.json'

import './Badges.scss';

export default class Badges extends Component
{
	constructor(props)
	{
		super(props);
	}

	render()
	{
		this.props.badges.reverse();
		return (
			<Scrollbar>
				<ul className='badges-inner'>
					{
						this.props.badges.map(badge => (
							<Badge key={badge.text} badge={badge}/>
						))
					}
				</ul>
			</Scrollbar>
		);
	}
}

class Badge extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <li
                className="badge"
            >
                <img
                    src={`${Config.API_HOST}/achievements/${this.props.badge.image}`}
                    alt="Badge"
                />
                <p>{this.props.badge.text}</p>
            </li>
        )
    }
}
