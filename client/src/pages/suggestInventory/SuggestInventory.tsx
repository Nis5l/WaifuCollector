import {Component} from 'react'
import Inventory from '../inventory/Inventory'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import redirectIfNecessary from '../../components/Redirecter'

import './SuggestInventory.scss'
import { AxiosPrivateProps, withAxiosPrivate } from '../../hooks/useAxiosPrivate'
import { AuthProps, withAuth } from '../../hooks/useAuth'

interface SuggestInventoryParams {
  id: string | undefined
}

type PropsSuggestInventory = RouteComponentProps<SuggestInventoryParams> & AxiosPrivateProps & AuthProps & {

}

type StateSuggestInventory = {
  error: any | undefined,
  loading: boolean
}

class SuggestInventory extends Component<PropsSuggestInventory, StateSuggestInventory> {
  private friendID: string;

  constructor(props: PropsSuggestInventory) {
    super(props);

    this.friendID = props.match.params.id != null ? props.match.params.id : "";

    this.state = {
      error: undefined,
      loading: false
    }
  }

  onCardClick(self: SuggestInventory, e: any, card: any) {
    self.setState({loading: true});

    this.props.axios.post(`/trade/${this.friendID}/suggestion/add/${card}`, {})
      .then((res: any) => {
        this.setState({loading: false});
		    self.props.history.push(`/trade/${this.friendID}`);
      }).catch((err: any) => {
        if (redirectIfNecessary(this.props.history, err)) return 1;

		if(err.response.data.error)
			self.setState({error: "Error: " + err.response.data.error});
		else
			self.setState({error: "Error: Internal Error"});
	  });
  }

  render() {
    const userID: string = this.props.auth != null ? this.props.auth.id : "";

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

export default withAxiosPrivate(withAuth(withRouter(SuggestInventory)));
