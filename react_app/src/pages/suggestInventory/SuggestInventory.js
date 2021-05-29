import {Component} from 'react'
import Inventory from '../inventory/Inventory'
import {withRouter} from 'react-router-dom'
import axios from 'axios'
import Cookies from 'js-cookie'
import {WaifuCardLoad} from '../../components/WaifuCard'
import redirectIfNecessary from '../../components/Redirecter'

import Config from '../../config.json'

import './SuggestInventory.scss'

class SuggestInventory extends Component {
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
    let data =
    {
      token: Cookies.get('token'),
      userID: this.friendID,
      cardID: card
    }
    console.log("Now");
    axios.post(`${Config.API_HOST}/suggesttrade`, data)
      .then((res) => {
        console.log(res.data);

        if (redirectIfNecessary(this.props.history, res.data)) return 1;

        this.setState({loading: false});
        if (res && res.status === 200) {
          if (res.data && res.data.status === 0) {
            self.props.history.push(`/trade/${this.friendID}`);
          } else {
            self.setState({error: "Error: " + res.data.message});
          }
        } else {
          self.setState({error: "Error: Internal Error"});
        }
      })
  }

  render() {
    return (
      <div className="tradeinventory_wrapper">
        {
          this.state.error === undefined &&
          < Inventory
            loading={this.state.loading}
            redirect={false}
            userID={this.friendID}
            friendID={Cookies.get('userID')}
            excludeSuggestions={true}
            onCardClick={(e, card) => {this.onCardClick(this, e, card)}}
            friend={true}
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
