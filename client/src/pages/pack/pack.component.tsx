import {Component} from 'react'

import redirectIfNecessary from '../../components/Redirecter'
import { LoadingComponent, GameCardLoadComponent, GameCardComponent } from '../../shared/components'
import { withAxiosPrivate } from '../../hooks/useAxiosPrivate'
import { withRouter } from '../../hooks/withRouter'
import { parseCards } from '../../utils';
import type { PackProps, PackState } from './types';

import './pack.component.scss'

const collector: string = "xxxxxxxxxxxxx";

class PackComponent extends Component<PackProps, PackState> {
    private key: number;
    private quitCooldown: number;
    private quittable: boolean;

    constructor(props: PackProps) {
        super(props);
        this.key = 0;
        this.quitCooldown = 800;
        this.quittable = false;

        this.state =
        {
            cards: [],
            loading: true
        }
    }

    componentDidMount() {
        this.props.axios.post(`${collector}/pack/open`, {})
            .then((res: any) => {
                this.setState({loading: false});

				let cards = res.data.cards;
				parseCards(cards);
				this.setState({cards: cards});
            }).catch((err: any) => {
                if(redirectIfNecessary(this.props.router.navigate, err)) return;
				this.props.router.navigate('/dashboard');
			});
    }

    startQuitCooldown(e: any, uuid: any, self: PackComponent) {
        if (!self.quittable) {
            setTimeout(() => {
                self.quittable = true;
            }, self.quitCooldown);
        }
        else {
            self.props.router.navigate(`/card/${uuid}`);
            e.stopPropagation();
            e.preventDefault();
        }
    }

    onQuit(e: any, self: PackComponent) {
        if (!self.quittable) return;
        self.props.router.navigate('/dashboard');
        e.preventDefault();
    }

    render() {
        return (
            <div onClick={(e) => {this.onQuit(e, this)}} className="container_pack" >
                <LoadingComponent loading={this.state.loading} />

                <div className="packtop-wrapper">
                    <div className="packtop" />
                    <div className="packtopshadow" />
                </div>
                <div className="packbottom-wrapper">
                    <div className="packbottomshadow" />
                    <div className="packbottom" />
                </div>
                <div className="packleft-wrapper">
                    <div className="packleft" />
                    <div className="packleftshadow" />
                </div>
                <div className="packright-wrapper">
                    <div className="packright" />
                    <div className="packrightshadow" />
                </div>

                <div className="pack_card_container">
                    <div className="packtopleftcorner" />
                    <div className="packbottomrightcorner" />
                    {
                        this.state.cards.length > 0 ? this.state.cards.map((card) => (
                            <div className="packcard" key={this.key++}>
                                <GameCardComponent
                                    card={card}
                                    size="1"
                                    cardcolor="transparent"
                                    clickable="true"
                                    turned="true"
                                    onturn={this.startQuitCooldown}
                                    onturndata={this}
                                />
                            </div>
                        ))
                            :
                            (
                                <div className="pack_load">
                                    <GameCardLoadComponent size={1}/>
                                </div>
                            )
                    }
                </div>
            </div>
        );
    }
}

export default withAxiosPrivate(withRouter(PackComponent));
