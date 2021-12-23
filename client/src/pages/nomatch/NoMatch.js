import React, {Component} from 'react'
import Card from '../../components/Card'

import './NoMatch.scss'

class NoMatch extends Component {
  constructor(props) {
    super();
    this.props = props;
  }

  render() {
    return (
      <div className="nopage_wrapper">
        <Card>
        (⌯˃̶᷄ ﹏ ˂̶᷄⌯)ﾟ <br/> <br/> This page doesn't exist
        </Card>
      </div>
    )
  }
}

export default NoMatch;
