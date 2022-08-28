import {Component} from 'react'
import Inventory from '../inventory/Inventory'
import {withRouter} from 'react-router-dom'
import axios from 'axios'
import Cookies from 'js-cookie'
import redirectIfNecessary from '../../components/Redirecter'

import Config from '../../config.json'

import './TradeInventory.scss'

class TradeInventory extends Component {
  constructor(props) {
    super(props);

    this.friendID = props.match.params.id;

    this.state = {
      error: undefined,
      loading: false
    }
  }

  onCardClick(self, e, card) {
    self.setState({loading: true});

	const config =
	{
		headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
	}

    axios.post(`${Config.API_HOST}/trade/${this.friendID}/card/add/${card}`, {}, config)
      .then(res => {
    	  self.props.history.push(`/trade/${this.friendID}`);
      }).catch(err => {
          if (redirectIfNecessary(this.props.history, err)) return;
          self.setState({error: "Error: Internal Error"});
	  });
  }

  render() {
    return (
      <div className="tradeinventory_wrapper">
        {
          this.state.error === undefined &&
          < Inventory
            redirect={false}
            userID={Cookies.get('userID')}
            friendID={this.friendID}
            loading={this.state.loading}
            onCardClick={(e, card) => {this.onCardClick(this, e, card)}}
          />
        }
        {
          this.state.error !== undefined && <h1>{this.state.error}</h1>
        }
      </div>
    )
  }
}

export default withRouter(TradeInventory);
