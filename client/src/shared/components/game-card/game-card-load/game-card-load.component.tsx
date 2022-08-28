import {Component} from 'react'
import {LoopCircleLoading} from 'react-loadingg'

import { DEFWIDTH, DEFHEIGTH } from '../constants';
import type { GameCardLoadProps } from './types';

export default class GameCardLoadComponent extends Component<GameCardLoadProps> {
    constructor(props: GameCardLoadProps) {
        super(props);
    }

    render() {
        return (
            <div className="waifucard_load"
                style=
                {{
                    width: `${DEFWIDTH * this.props.size}px`,
                    height: `${DEFHEIGTH * this.props.size}px`,
                }}
            >
                <LoopCircleLoading
                    color="#d8d8d8" />
            </div>
        )
    }
}