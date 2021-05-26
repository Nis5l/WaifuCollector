import {Component} from 'react'
import Inventory from '../inventory/Inventory'
import {withRouter} from 'react-router-dom'
import axios from 'axios'
import Cookies from 'js-cookie'

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
    let data =
    {
      token: Cookies.get('token'),
      userID: this.friendID,
      cardID: card
    }
    axios.post(`${Config.API_HOST}/addtrade`, data)
      .then((res) => {
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
