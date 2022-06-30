import React, {Component} from 'react'
import Card from '../../components/Card'

import './NoMatch.scss'

class NoMatch extends Component {
  render() {
    return (
      <div className="nopage_wrapper">
        <Card
          title={''}
          styleClassName={''}
          icon={''}
          iconNum={0}
          onIconClick={function (): void {} }
          onClick={function (event: any): void {} }
        >
        (⌯˃̶᷄ ﹏ ˂̶᷄⌯)ﾟ <br/> <br/> This page doesn't exist
        </Card>
      </div>
    )
  }
}

export default NoMatch;
