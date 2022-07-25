import React, {Component} from 'react'
import Logo from '../../components/Logo'
import { ProfileNameComponent } from '../../shared/components'
import Loading from '../../components/Loading'
import { CardComponent } from '../../shared/components'

import './Settings.scss'
import { AxiosPrivateProps, withAxiosPrivate } from '../../hooks/useAxiosPrivate'
import { AuthProps, withAuth } from '../../hooks/useAuth'
import { ReactRouterProps, withRouter } from '../../hooks/withRouter'

type PropsSettings = ReactRouterProps & AxiosPrivateProps & AuthProps & {};

type StateSettings = {
  loading: boolean,
  mail: string,
  showpass: string,

  passwordopen: boolean,
  password: string,
  passwordRepeat: string,
  passwordRepeatWrong: boolean,
  passwordWrong: boolean,
  passwordMessage: string | undefined
}

class Settings extends Component<PropsSettings, StateSettings> {
  private lCounter: number;
  private lCounterMax: number;
  private passInterval: NodeJS.Timeout | undefined;

  constructor(props: PropsSettings) {
    super(props);

    this.lCounter = 0;
    this.lCounterMax = 1;

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
  }

  incrementLCounter() {
    this.lCounter++;
    if (this.lCounter === this.lCounterMax)
      this.setState({loading: false});
  }

  togglePassword() {
    this.setState({passwordopen: !this.state.passwordopen});
  }

  handleSubmit(event: any) {
    event.preventDefault();

    this.setState({
      password: "",
      passwordRepeat: "",
      passwordRepeatWrong: true,
      passwordWrong: true
    });

    const data =
    {
    	newPassword: this.state.password
    }

    this.props.axios.post(`/passchange`, data)
      .then((res: any) => {
	  	this.setState({passwordMessage: "Password changed!", passwordopen: false});
      })
  }

  render() {
    const disabled = this.state.passwordWrong || this.state.passwordRepeatWrong;
    const userID: string = this.props.auth.id;
    return (
      <div className="settings_wrapper">
        <CardComponent
          title={''}
          styleClassName={''}
          icon={''}
          iconNum={0}
          onIconClick={function (): void {} }
          onClick={function (event: any): void {} }
        >
          <Loading loading={this.state.loading} />
          <Logo className="" size="200px" />
          <div className="username">Username: &nbsp;
            <ProfileNameComponent
              userID={userID}
              lCallback={() => { this.incrementLCounter() } }
              username={''}
              badges={undefined}
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
        </CardComponent>
      </div >
    )
  }
}

export default withAxiosPrivate(withAuth(withRouter(Settings)));
