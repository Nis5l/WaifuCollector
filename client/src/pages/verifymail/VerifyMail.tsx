import {Component} from 'react'
import Card from '../../components/Card'
import {WaifuCardLoad} from '../../components/WaifuCard'
import {checkMail} from '../../Utils'
import Loading from '../../components/Loading'
import Logo from '../../components/Logo'

import './VerifyMail.scss'
import { AxiosPrivateProps, withAxiosPrivate } from '../../hooks/useAxiosPrivate'
import { ReactRouterProps, withRouter } from '../../hooks/withRouter'

type PropsVerifyMail = ReactRouterProps & AxiosPrivateProps & {}

type StateVerifyMail = {
  email: string,
  matches: boolean,
  loaded: boolean,
  loading: boolean,
  error: any
}

class VerifyMail extends Component<PropsVerifyMail, StateVerifyMail> {
  constructor(props: PropsVerifyMail) {
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

    this.props.axios.get(`/verify/check`)
      .then((res: any) => {
    	  this.setState({loading: false});
          switch (res.data.verified) {
            case 1:
              this.props.router.navigate('/verify');
              break;
            case 2:
              this.setState({loaded: true});
              break;
            default:
              this.props.router.navigate('/dashboard');
          }
      }).catch((err: any) => {
		    console.log("Unexpected /verify/check error");
	    });
  }

  onSubmit = () => {
    this.setState({error: undefined})

    const data = {
      email: this.state.email
    }

    this.props.axios.post(`/email/change`, data)
      .then((res: any) => {
    	  this.props.router.navigate('/verify');
      }).catch((err: any) => {
		  if(err.response)
    		this.setState({error: err.response.data.error})
	    });
  }

  setEmail = (self: VerifyMail, email: string) => {
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

export default withAxiosPrivate(withRouter(VerifyMail));
