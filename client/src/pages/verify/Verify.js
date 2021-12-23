import React, {Component} from 'react'
import Card from '../../components/Card'
import {WaifuCardLoad} from '../../components/WaifuCard'
import Loading from '../../components/Loading'
import Logo from '../../components/Logo'

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
	  console.log(this.key);

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
	const config =
	{
		headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
	}

    axios.post(`${Config.API_HOST}/verify/confirm/${this.key}`, {}, config)
      .then(res => {
	    this.props.history.push('/dashboard');
      }).catch(err => {
		console.log("Unexpected /verify/confirm/:key error");
	  }).finally(() => {
        this.incrementLCounter();
	  });

    axios.get(`${Config.API_HOST}/verify/check`, config)
      .then((res) => {
    	  this.incrementLCounter();
          switch (res.data.verified) {
            case 1:
              this.setState({mail: res.data.email});
              break;

            case 2:
              this.props.history.push('/verify/mail');
              break;

            default:
              this.props.history.push('/dashboard');
          }
      }).catch(err => {
		console.log("Unexpected /verify/check error");
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

	const config =
	{
		headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
	}

    axios.post(`${Config.API_HOST}/verify/resend`, {}, config)
      .then(res => {
		  this.setState({mail: mail});
		  let t = new Date();
		  t.setSeconds(t.getSeconds() + 30);
		  Cookies.set('resenttimeout', t);
		  this.startTimer();
      })
  }

  delete = () => {
    this.setState({mail: undefined});
	const config =
	{
		headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
	}
    axios.post(`${Config.API_HOST}/email/delete`, {}, config)
      .then(res => {
         this.props.history.push('/verify/mail');
      })
  }

  render() {
    return (
      <div>
        <Loading loading={this.state.loading} />
        <Card styleClassName="verify">

          <Logo className="logo" />

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