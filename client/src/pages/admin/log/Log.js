import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'
import Cookies from 'js-cookie'
import axios from 'axios'

import Loading from '../../../components/Loading'

import Config from '../../../config.json'
import Scrollbar from '../../../components/ScrollBar'

import './Log.scss'

class AdminLog extends Component {

	constructor(props) {
		super(props);

		this.state =
		{
			loading: true,
			log: ""
		}
	}

	componentDidMount() {
        const config =
        {
			headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
        }

		axios.get(`${Config.API_HOST}/admin/log`, config)
			.then(res => {
				res.data.log = res.data.log.split("\n").reverse().join("\n");
				this.setState({loading: false, log: res.data.log});
			}).catch(err => {
				this.props.history.push("/dashboard");
			});
	}

	render() {
		return (
			<div className="admin_log">
				<Loading loading={this.state.loading} />
				<Scrollbar>
					<pre>
						{this.state.log}
					</pre>
				</Scrollbar>
			</div>
		)
	}
}

export default withRouter(AdminLog);
