import {Component} from 'react'
import Inventory from '../inventory/Inventory'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import axios from 'axios'
import Cookies from 'js-cookie'
import redirectIfNecessary from '../../components/Redirecter'

import Config from '../../config.json'

import './TradeInventory.scss'

interface TradeInventoryParams {
  id: string | undefined
}

type PropsTradeInventory = RouteComponentProps<TradeInventoryParams> & {

}

type StateTradeInventory = {
  loading: boolean,
  error: any
}

class TradeInventory extends Component<PropsTradeInventory, StateTradeInventory> {
  private friendID: string = "";
  
  constructor(props: PropsTradeInventory) {
    super(props);

    const friendID = props.match.params.id;
    if(friendID != null) this.friendID = friendID;

    this.state = {
      error: undefined,
      loading: false
    }
  }

  onCardClick(self: TradeInventory, e: any, card: any) {
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
    const userID = Cookies.get('userID');
    
    return (
      <div className="tradeinventory_wrapper">
        {
          this.state.error === undefined &&
          < Inventory
            redirect={false}
            userID={parseInt(userID != null ? userID : "0")}
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
