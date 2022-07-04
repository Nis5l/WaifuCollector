import {Component} from 'react'
import Inventory from '../inventory/Inventory'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import axios from 'axios'
import Cookies from 'js-cookie'
import redirectIfNecessary from '../../components/Redirecter'

import Config from '../../config.json'

import './SuggestInventory.scss'

interface SuggestInventoryParams {
  id: string | undefined
}

type PropsSuggestInventory = RouteComponentProps<SuggestInventoryParams> & {

}

type StateSuggestInventory = {
  error: any | undefined,
  loading: boolean
}

class SuggestInventory extends Component<PropsSuggestInventory, StateSuggestInventory> {
  private friendID: number;

  constructor(props: PropsSuggestInventory) {
    super(props);

    this.friendID = parseInt(props.match.params.id ? props.match.params.id : "0");

    this.state = {
      error: undefined,
      loading: false
    }
  }

  onCardClick(self: SuggestInventory, e: any, card: any) {
    self.setState({loading: true});
	const config =
	{
		headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
	}
    axios.post(`${Config.API_HOST}/trade/${this.friendID}/suggestion/add/${card}`, {}, config)
      .then(res => {
        this.setState({loading: false});
		self.props.history.push(`/trade/${this.friendID}`);
      }).catch(err => {
        if (redirectIfNecessary(this.props.history, err)) return 1;

		if(err.response.data.error)
			self.setState({error: "Error: " + err.response.data.error});
		else
			self.setState({error: "Error: Internal Error"});
	  });
  }

  render() {
    const userIDData = Cookies.get("userID");
    const userID: string = userIDData != null ? userIDData : "0";

    return (
      <div className="tradeinventory_wrapper">
        {
          this.state.error === undefined &&
          < Inventory
            loading={this.state.loading}
            redirect={false}
            userID={this.friendID}
            friendID={userID}
            excludeSuggestions={true}
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

export default withRouter(SuggestInventory);
