import React, {Component} from 'react'
import Card from '../../components/Card'

import Cookies from 'js-cookie'
import axios from 'axios'

import './VerifyMail.scss'

class VerifyMail extends Component {
  constructor(props) {
    super(props);
    this.state =
    {
      matches: false,
      email: ""
    }
  }

  onSubmit = () => {

  }

  setEmail = (self, email) => {
    const matches = VerifyMail.REGEX.test(email);
    self.setState({email: email, matches: matches});
  }

  render() {
    return (
      <Card styleClassName="verifymail">

        <img
          src="/assets/Icon.png"
          alt="Logo"
          className="logo"
        ></img>

        <form onSubmit={this.onSubmit}>

          <input
            type="text"
            className={"text_input " + (this.state.matches === false ? "invalid" : "")}
            name="email"
            placeholder="E-Mail"
            value={this.email}
            onChange={(e) => this.setEmail(this, e.target.value)}
          />

          <input className="button_input" type="submit" name="submit" value="Verify" disabled={!this.state.matches} />

        </form>

      </Card>
    )
  }
}

VerifyMail.REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export default VerifyMail;
