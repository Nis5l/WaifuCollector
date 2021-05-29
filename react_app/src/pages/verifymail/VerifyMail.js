import React, {Component} from 'react'
import Card from '../../components/Card'
import {WaifuCardLoad} from '../../components/WaifuCard'
import {checkMail} from '../../Utils'
import Loading from '../../components/Loading'
import Logo from '../../components/Logo'

import Cookies from 'js-cookie'
import axios from 'axios'

import Config from '../../config.json'

import './VerifyMail.scss'

class VerifyMail extends Component {
  constructor(props) {
    super(props);
    this.state =
    {
      matches: false,
      email: "",
      loaded: false,
      error: undefined,
      loading: true
    }
  }

  componentDidMount() {
    axios.get(`${Config.API_HOST}/verified?token=${Cookies.get('token')}`)
      .then((res) => {
        this.setState({loading: false});
        if (res.data && res.data.status === 0) {
          switch (res.data.verified) {
            case 1:
              this.props.history.push('/verify');
              break;

            case 2:
              this.setState({loaded: true});
              break;

            default:
              this.props.history.push('/dashboard');
          }
          return;
        }
      });
  }

  onSubmit = () => {
    this.setState({error: undefined})
    const data = {
      token: Cookies.get('token'),
      mail: this.state.email
    }
    axios.post(`${Config.API_HOST}/setmail`, data)
      .then((res) => {
        if (res.data) {
          if (res.data.status === 0)
            this.props.history.push('/verify');
          else
            this.setState({error: res.data.message})
        }
      })
  }

  setEmail = (self, email) => {
    const matches = !checkMail(email);
    self.setState({email: email, matches: matches});
  }

  render() {
    return (
      <div>
        <Loading loading={this.state.loading} />
        <Card styleClassName="verifymail">

          <Logo className="logo" />

          {this.state.loaded === true ?
            <div className="input_wrapper">

              {
                this.state.error !== undefined &&
                <p className="error">{this.state.error}</p>
              }

              <input
                type="text"
                className={"text_input " + (this.state.matches === false ? "invalid" : "")}
                name="email"
                placeholder="E-Mail"
                value={this.state.email}
                onChange={(e) => this.setEmail(this, e.target.value)}
              />

              <input
                className="button_input"
                onClick={this.onSubmit}
                type="submit"
                name="submit"
                value="Verify"
                disabled={!this.state.matches}
              />
            </div>
            :
            <WaifuCardLoad />
          }

        </Card>
      </div>
    )
  }
}

export default VerifyMail;
