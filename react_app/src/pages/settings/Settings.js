import React, {Component} from 'react'
import Logo from '../../components/Logo'
import ProfileName from '../../components/ProfileName'
import Loading from '../../components/Loading'
import Card from '../../components/Card'
import redirectIfNecessary from '../../components/Redirecter'

import Config from '../../config.json'
import {withRouter} from 'react-router-dom'
import axios from 'axios'
import Cookies from 'js-cookie'

import './Settings.scss'

class Settings extends Component {

  constructor(props) {
    super(props);

    this.lCounter = 0;
    this.lCounterMax = 2;

    this.state =
    {
      loading: true,
      mail: "",
      showpass: this.getNewPass(),

      passwordopen: false,
      password: "",
      passwordRepeat: "",
      passwordRepeatWrong: true,
      passwordWrong: true,
      passwordMessage: undefined
    }
  }

  componentWillUnmount() {
    if (this.passInterval) clearInterval(this.passInterval);
  }

  getNewPass() {
    const set = "qᚹᛖᚱᛏzᚢᛁᚩᛈᚪᛋᛞᚠᚷᚻᛡkᛚöäᚣᛉᚳvᛒᚾᛗ********#####";

    let password = "";

    for (let i = 0; i <= 5; i++)
      password += set[Math.floor(Math.random() * set.length)];

    return password;
  }

  componentDidMount() {

    //this.passInterval = setInterval(() => {
    //let password = this.getNewPass();

    //this.setState({showpass: password});
    //}, 100);

    const data =
    {
      token: Cookies.get("token")
    }

    axios.post(`${Config.API_HOST}/mail`, data)
      .then((res) => {
        if (redirectIfNecessary(this.props.history, res.data)) return;
        this.incrementLCounter();

        if (res.data.status === 0)
          this.setState({mail: res.data.mail});
      })
  }

  incrementLCounter() {
    this.lCounter++;
    if (this.lCounter === this.lCounterMax)
      this.setState({loading: false});
  }

  togglePassword() {
    this.setState({passwordopen: !this.state.passwordopen});
  }

  handleSubmit(event) {
    event.preventDefault();

    this.setState({
      password: "",
      passwordRepeat: "",
      passwordRepeatWrong: true,
      passwordWrong: true
    });

    const data =
    {
      token: Cookies.get("token"),
      newpassword: this.state.password
    }
    axios.post(`${Config.API_HOST}/passchange`, data)
      .then((res) => {
        console.log(res.data);
        if (res.data.status === 0) {
          this.setState({passwordMessage: "Password changed!", passwordopen: false});
        }
      })
  }

  render() {
    const disabled = this.state.passwordWrong || this.state.passwordRepeatWrong;
    return (
      <div className="settings_wrapper">
        <Card>
          <Loading loading={this.state.loading} />
          <Logo size="200px" />
          <div className="username">Username: &nbsp;
            <ProfileName
              userID={Cookies.get("userID")}
              lCallback={() => {this.incrementLCounter(this)}}
            />
          </div>
          <p className="password">Password: {this.state.showpass} <i className="fas fa-edit wiggle" onClick={() => this.togglePassword()} /></p>
          {
            this.state.passwordMessage !== undefined &&
            <p className="success">{this.state.passwordMessage}</p>
          }
          <form onSubmit={e => this.handleSubmit(e)} className={this.state.passwordopen ? "open" : ""}>
            <input
              type="password"
              className={"text_input" + (this.state.passwordWrong ? " invalid" : "")}
              placeholder="New Password"
              value={this.state.password}
              onChange={
                (e) => {
                  this.setState(
                    {
                      password: e.target.value,
                      passwordWrong: e.target.value.length < 8 || e.target.value.length > 30
                    });
                }
              }
            /><br />
            <input
              type="password"
              className={"text_input" + (this.state.passwordRepeatWrong ? " invalid" : "")}
              placeholder="Repeat Password"
              value={this.state.passwordRepeat}
              onChange={
                (e) => {
                  this.setState(
                    {
                      passwordRepeat: e.target.value,
                      passwordRepeatWrong: e.target.value !== this.state.password
                    });
                }
              }
            /><br />
            <input type="submit" className="button_input" value="Change" disabled={disabled} />
          </form>
        </Card>
      </div >
    )
  }
}

export default withRouter(Settings);
