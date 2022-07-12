import {Component} from 'react'
import Card from '../../components/Card'
import {WaifuCardLoad} from '../../components/WaifuCard'
import Loading from '../../components/Loading'
import Logo from '../../components/Logo'

import Cookies from 'js-cookie'
import {RouteComponentProps, withRouter} from 'react-router-dom'

import './Verify.scss'
import { AxiosPrivateProps, withAxiosPrivate } from '../../hooks/useAxiosPrivate'

function queryString(queryString: string) {
  var query: Map<string, string> = new Map<string, string>();
  var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      query.set(decodeURIComponent(pair[0]), decodeURIComponent(pair[1] || ''));
  }
  return query;
}

type PropsVerify = RouteComponentProps & AxiosPrivateProps & {

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
    this.props.axios.post(`/verify/confirm/${this.key}`, {})
      .then((res: any) => {
	    this.props.history.push('/dashboard');
      }).catch((err: any) => {
		    console.log("Unexpected /verify/confirm/:key error");
      }).finally(() => {
          this.incrementLCounter();
      });

    this.props.axios.get(`/verify/check`)
      .then((res: any) => {
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
      }).catch((err: any) => {
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

    this.props.axios.post(`/verify/resend`, {})
      .then((res: any) => {
        this.setState({mail: mail});
        let t = new Date();
        t.setSeconds(t.getSeconds() + 30);
        Cookies.set('resenttimeout', t.toString());
        this.startTimer();
      })
  }

  delete = () => {
    this.setState({mail: undefined});
    this.props.axios.post(`/email/delete`, {})
      .then((res: any) => {
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

export default withRouter(withAxiosPrivate(Verify));
