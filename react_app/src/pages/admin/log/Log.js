import React, {Component} from 'react'
import Cookies from 'js-cookie'
import axios from 'axios'

import Loading from '../../../components/Loading'

import Config from '../../../config.json'
import Scrollbar from '../../../components/ScrollBar'

import './Log.scss'

class AdminLog extends Component {

	constructor(props) {
		super(props);

		console.log("DS");

		this.state =
		{
			loading: true,
			log: ""
		}
	}

	componentDidMount() {
		console.log("OKDSf");
		const data =
		{
			token: Cookies.get('token')
		}
		axios.post(`${Config.API_HOST}/log`, data)
			.then((res) => {
				console.log(res.data);
				if (res.data && res.data.status === 0) {
					res.data.log = res.data.log.split("\n").reverse().join("\n");
					this.setState({loading: false, log: res.data.log});
				}
			})
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

export default AdminLog;
