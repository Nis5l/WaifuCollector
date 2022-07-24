import React, {Component} from 'react'
import { CardComponent } from '../../shared/components'

import './NoMatch.scss'

class NoMatch extends Component {
  render() {
    return (
      <div className="nopage_wrapper">
        <CardComponent
          title={''}
          styleClassName={''}
          icon={''}
          iconNum={0}
          onIconClick={function (): void {} }
          onClick={function (event: any): void {} }
        >
        (⌯˃̶᷄ ﹏ ˂̶᷄⌯)ﾟ <br/> <br/> This page doesn't exist
        </CardComponent>
      </div>
    )
  }
}

export default NoMatch;
