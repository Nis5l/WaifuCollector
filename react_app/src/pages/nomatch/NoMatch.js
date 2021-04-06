import React, {Component} from 'react'
import Card from '../../components/Card'
import {LoopCircleLoading} from 'react-loadingg';

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
          Error 404 - Page not found
        </Card>
      </div>
    )
  }
}

export default NoMatch;
