import {Component} from 'react'
import { CardComponent } from '../../shared/components'

import './no-match.component.scss'

class NoMatchComponent extends Component {
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

export default NoMatchComponent;
