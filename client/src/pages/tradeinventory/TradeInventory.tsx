import {Component} from 'react'
import Inventory from '../inventory/Inventory'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import redirectIfNecessary from '../../components/Redirecter'

import './TradeInventory.scss'
import { AxiosPrivateProps, withAxiosPrivate } from '../../hooks/useAxiosPrivate'
import { AuthProps, withAuth } from '../../hooks/useAuth'

interface TradeInventoryParams {
  id: string | undefined
}

type PropsTradeInventory = RouteComponentProps<TradeInventoryParams> & AxiosPrivateProps & AuthProps & {

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

    this.props.axios.post(`/trade/${this.friendID}/card/add/${card}`, {})
      .then((res: any) => {
    	  self.props.history.push(`/trade/${this.friendID}`);
      }).catch((err: any) => {
          if (redirectIfNecessary(this.props.history, err)) return;
          self.setState({error: "Error: Internal Error"});
	  });
  }

  render() {
    const userID = this.props.auth.id;
    
    return (
      <div className="tradeinventory_wrapper">
        {
          this.state.error === undefined &&
          < Inventory
            redirect={false}
            userID={parseInt(userID != null ? userID : "")}
            friendID={this.friendID}
            loading={this.state.loading}
            onCardClick={(e: any, card: any) => {this.onCardClick(this, e, card)}}
          />
        }
        {
          this.state.error !== undefined && <h1>{this.state.error}</h1>
        }
      </div>
    )
  }
}

export default withAxiosPrivate(withAuth(withRouter(TradeInventory)));
