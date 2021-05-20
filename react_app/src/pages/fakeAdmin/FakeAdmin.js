import React, {Component} from 'react'
import Card from '../../components/Card'

import './FakeAdmin.scss'

class FakeAdmin extends Component {

  constructor(props) {
    super(props)

    this.state = {
      username: "",
      outusername: undefined,
      admins: ["admin", "Nissl", "SmallCode"]
    }
  }

  render() {
    return (
      <div className="fakeadmin_wrapper">
        <Card
          title="Data"
          styleClassName="status"
        >
          <p>
            Status: Running<br />
            Domain: waifucollector.com <br />
            API-Domain: api.waifucollector.com <br />
            Current-Acces: FULL <br />
            Admins: <br />
            {
              this.state.admins.map((admin) => (
                <div>-"{admin}"<br /></div>
              ))
            }
          </p>
        </Card>
        <Card
          title="Manage"
          styleClassName="delete"
        >
          <p>Grand admin access:</p>
          <input
            type="text"
            className="text_input"
            placeholder="username"
            value={this.state.username}
            onChange={(e) => {
              this.setState({username: e.target.value});
            }}
          />
          <input
            type="button"
            className="button_input"
            value="Grant Admin"
            onClick={() => {
              this.setState({outusername: this.state.username, admins: [...this.state.admins, this.state.username]});
            }}
          />
          {this.state.outusername !== undefined && <p style={{color: "green"}}>Granted access to {this.state.outusername}.</p>}
          <p style={{marginTop: "20px"}}><a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="__blank">Delete Database</a>, only click after creating backups.</p>
        </Card>
      </div>
    )
  }
}

export default FakeAdmin;
