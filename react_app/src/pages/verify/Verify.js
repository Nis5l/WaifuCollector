import React, {Component} from 'react'
import Card from '../../components/Card'
import {WaifuCardLoad} from '../../components/WaifuCard'
import Loading from '../../components/Loading'

import Config from '../../config.json'
import Cookies from 'js-cookie'
import axios from 'axios'
import {withRouter} from 'react-router-dom'

import './Verify.scss'

const queryString = require('query-string');

class Verify extends Component {

  constructor(props) {
    super(props);

    this.key = queryString.parse(props.location.search)['key'];

    this.lCount = 0;
    this.lCountMax = 2;

    this.state =
    {
      mail: undefined,
      time: 0,
      loading: true
    }
  }

  componentDidMount() {
    const data =
    {
      token: Cookies.get('token'),
      key: this.key
    }

    axios.post(`${Config.API_HOST}/verify`, data)
      .then((res) => {
        this.incrementLCounter();
        if (res.data && res.data.status === 0) {
          this.props.history.push('/dashboard');
          return;
        }
      });

    axios.get(`${Config.API_HOST}/verified?token=${Cookies.get('token')}`)
      .then((res) => {
        this.incrementLCounter();
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
    this.startTimer();
  }

  incrementLCounter() {
    this.lCount++;
    if (this.lCount === this.lCountMax) this.setState({loading: false});
  }

  startTimer() {
    clearInterval(this.timeout);

    let cookiedate = new Date(0);
    if (Cookies.get('resenttimeout') !== undefined)
      cookiedate = new Date(Cookies.get('resenttimeout'));

    let t = new Date();
    let time = cookiedate.getTime() - t.getTime();
    time = parseInt(time / 1000);
    this.setState({time: time});

    this.timeout = setInterval(() => {
      time -= 1;
      if (time <= 0) clearInterval(this.timeout);
      this.setState({time: time});
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timeout);
  }

  resend = () => {
    if (this.state.time > 0) return;
    const mail = this.state.mail;
    this.setState({mail: undefined});
    const data = {
      token: Cookies.get('token')
    }

    axios.post(`${Config.API_HOST}/verify/resend`, data)
      .then((res) => {
        if (res.data && res.data.status === 0) {
          this.setState({mail: mail});
          let t = new Date();
          t.setSeconds(t.getSeconds() + 30);
          Cookies.set('resenttimeout', t);
          this.startTimer();
        }
      })
  }

  delete = () => {
    this.setState({mail: undefined});
    const data = {
      token: Cookies.get('token')
    }
    axios.post(`${Config.API_HOST}/deletemail`, data)
      .then((res) => {
        if (res.data && res.data.status === 0) {
          this.props.history.push('/verify/mail');
        }
      })
  }

  render() {
    return (
      <div>
        <Loading loading={this.state.loading} />
        <Card styleClassName="verify">

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
                <div className="text_wrapper">
                  <p style={{fontSize: "14pt"}}>The verification email was sent to {this.state.mail}.</p>
                  <p
                    className={"underlined " + (this.state.time <= 0 ? "clickable" : "defaultpointer")}
                    style={{color: this.state.time > 0 ? "gray" : ""}}
                    onClick={this.resend}>
                    Resend {this.state.time > 0 ? ` (${this.state.time})` : ""}
                  </p>
                  <p className="clickable underlined" onClick={this.delete}>Change E-Mail</p>
                </div>
              )
          }


        </Card>
      </div>
    )
  }
}

export default withRouter(Verify);
