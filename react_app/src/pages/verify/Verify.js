import React, {Component} from 'react'
import Card from '../../components/Card'
import {WaifuCardLoad} from '../../components/WaifuCard'

import Config from '../../config.json'
import Cookies from 'js-cookie'
import axios from 'axios'
import {withRouter} from 'react-router-dom'

import './Verify.scss'

class Verify extends Component {

  constructor(props) {
    super(props);

    this.state =
    {
      mail: undefined
    }
  }

  componentDidMount() {
    axios.get(`${Config.API_HOST}/verified?token=${Cookies.get('token')}`)
      .then((res) => {
        if (res.data && res.data.status === 0) {
          switch (res.data.verified) {
            case 1:
              this.setState({mail: res.data.mail});
              break;

            case 2:
              this.props.history.push('/verify/mail');
              break;

            default:
              this.props.history.push('/dashboard');
          }
          return;
        }
      });
  }

  render() {
    return (
      <Card styleClassName="verifymail">

        <img
          src="/assets/Icon.png"
          alt="Logo"
          className="logo"
        ></img>

        {
          this.state.mail === undefined ?
            <WaifuCardLoad />
            :
            (
              <div>
                <h2>The verification email sent to {this.state.mail} needs to be accepted.</h2>
                <a href="<%-url%>/verify/resend">Click to send again.</a>
                <a href="<%-url%>/verify/delete">Click to change email.</a>
              </div>
            )
        }


      </Card>
    )
  }
}

export default withRouter(Verify);
