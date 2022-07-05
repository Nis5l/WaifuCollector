import React, {Component} from 'react'
import Card from '../../components/Card'
import {WaifuCardLoad} from '../../components/WaifuCard'
import Loading from '../../components/Loading'
import Logo from '../../components/Logo'

import Config from '../../config.json'
import Cookies from 'js-cookie'
import axios from 'axios'
import {RouteChildrenProps, RouteComponentProps, withRouter} from 'react-router-dom'

import './Verify.scss'

function queryString(queryString: string) {
  var query: Map<string, string> = new Map<string, string>();
  var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      query.set(decodeURIComponent(pair[0]), decodeURIComponent(pair[1] || ''));
  }
  return query;
}

type PropsVerify = RouteComponentProps & {

}

type StateVerify = {
  time: number,
  mail: string | undefined,
  loading: boolean
}

class Verify extends Component<PropsVerify, StateVerify> {
  private key: string = "";
  private lCount: number;
  private lCountMax: number;

  private timeout: NodeJS.Timeout | undefined;

  constructor(props: PropsVerify) {
    super(props);

    const key = queryString(props.location.search).get('key');
    if(key != null) this.key = key;

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
    const resentmentTimeout = Cookies.get('resenttimeout');
    if (resentmentTimeout !== undefined)
      cookiedate = new Date(resentmentTimeout);

    let t = new Date();
    let time = cookiedate.getTime() - t.getTime();
    time = time / 1000;
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
		  Cookies.set('resenttimeout', t.toString());
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