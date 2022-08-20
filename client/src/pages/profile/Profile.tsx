import {Component} from 'react'
import { CardComponent, LogoComponent, LoadingComponent } from '../../shared/components'
import WaifuCard, {parseCards} from '../../components/WaifuCard'

import "./Profile.scss"
import { AchievementsComponent, ScrollbarComponent, ProfileNameComponent, FriendListComponent } from '../../shared/components';
import { AxiosPrivateProps, withAxiosPrivate } from '../../hooks/useAxiosPrivate'
import { AuthProps, withAuth } from '../../hooks/useAuth'
import { ReactRouterProps, withRouter } from '../../hooks/withRouter'

type PropsProfile = ReactRouterProps & AxiosPrivateProps & AuthProps & {

}

type StateProfile = {
    stats: {
        friends: number,
        maxFriends: number,
        cards: number,
        maxCards: number,
        trades: number,
        maxTrades: number,
        achievements: any
    },
    friendStatus: number,
    loading: boolean,
    flexCards: any[]
}

const collector: string = "xxxxxxxxxxxxx";

class Profile extends Component<PropsProfile, StateProfile> {
    private userID: string;
    private lcounter: number;
    private lcounterMax: number;

    constructor(props: PropsProfile) {
        super(props);

        this.userID = props.router.params.id != null ? props.router.params.id : "";

        this.lcounter = 0;
        this.lcounterMax = 2;

        this.state =
        {
			stats: {friends: 0, maxFriends: 0, cards: 0, maxCards: 0, trades: 0, maxTrades: 0, achievements: []},
            friendStatus: -1,
            loading: true,
            flexCards: []
        }
    }

    componentDidMount() {

        async function loadStats(self: Profile, userID: string) {
			try {
				const reponse = await self.props.axios.get(`/user/${userID}/stats`);
                return reponse.data;
			} catch (err) {
				console.log("Unexpected /user/:id/stats error");
				return [];
			}
        }

        async function loadFlexCards(self: Profile, userID: string) {
			try {
				const res = await self.props.axios.get(`/user/${userID}/${collector}/flex`)
                parseCards(res.data);
                return res.data;
			} catch (err) {
				return [];
			}
        }

        async function updateStats(self: Profile) {

            const stats = await loadStats(self, self.userID);

            const cards = await loadFlexCards(self, self.userID);

            self.setState({stats: stats, flexCards: cards});
            self.incrementLCounter();
        }

        updateStats(this);

    }

    onFriendData(data: any) {
        this.incrementLCounter();
        if(this.props.auth == null) return;

        const ownID = this.props.auth.id;

        let status = -1;

        if (ownID == null || ownID === this.userID) {
            this.setState({friendStatus: 3});
            return;
        }

        for (let i = 0; i < data.length; i++) {
            if (data[i].userId === ownID) {
                status = data[i].status;
                break;
            }
        }

        this.setState({friendStatus: status});
    }

    onFriendAdd() {
        const data = {
            userId: this.userID
        };
        this.props.axios.post(`/friend/add`, data);
        this.setState({friendStatus: 2});
    }

    incrementLCounter() {
        this.lcounter++;
        if (this.lcounter === this.lcounterMax) this.setState({loading: false});
    }

    render() {
        let icon = "";
        let onIconClick = () => {}

        if(this.props.auth != null){
            if (this.state.friendStatus === -1) {
                icon = "fa-user-plus";
                onIconClick = () => this.onFriendAdd();
            }
            else if (this.state.friendStatus === 0) {
                icon = "fa-handshake";
                onIconClick = () => {this.props.router.navigate(`/trade/${this.userID}`)}
            }
        }

        let cardsize = 0.54;
        let w = window.innerWidth;
        if (w > 2000)
            cardsize = 0.7;

        return (
            <div className="container_profile">

                <LoadingComponent loading={this.state.loading} />

                <CardComponent
                    title="Account Info"
                    styleClassName="accountInfo"
                    icon={icon}
                    onIconClick={onIconClick} iconNum={0} onClick={function (event: any): void {} }
                >

                    <div className="avatar">

                        <LogoComponent className="logo" size="" />

                    </div>

                    <div className="profilename_container">

                        <ProfileNameComponent
                            userID={this.userID}
                            username={''}
                            badges={undefined}
                            lCallback={function (): void {} }
                        />

                    </div>

                    <table className="stats">

                        <tbody>

                            <tr>

                                <td>Friends:</td>
                                <td>{`${this.state.stats.friends}/${this.state.stats.maxFriends}`}</td>

                            </tr>

                        </tbody>

                    </table>

                </CardComponent>

                <CardComponent
                    title="Achievements"
                    styleClassName="badges"
                    icon={''}
                    iconNum={0}
                    onIconClick={function (): void {} }
                    onClick={function (event: any): void {} }
                >
					<AchievementsComponent achievements={this.state.stats.achievements} />
                </CardComponent>

                <CardComponent
                    title="Best Waifu"
                    styleClassName="flexen"
                    icon={''}
                    iconNum={0}
                    onIconClick={function (): void {} }
                    onClick={function (event: any): void {} }
                >
                    <div className="flex-grid">
                        <ScrollbarComponent>
                            {
                                this.state.flexCards.map((card) => (
                                    <div className="waifucard_wrapper" key={"card-" + card.id}>
                                        <WaifuCard
                                            card={card}
                                            size={cardsize}
                                            clickable="false"
                                        />
                                    </div>
                                ))
                            }
                        </ScrollbarComponent>
                    </div>

                </CardComponent>

                <div className="friends_wrapper">
                    <CardComponent
                        title="Friends"
                        styleClassName="friends"
                        icon={''}
                        iconNum={0}
                        onIconClick={function (): void {} }
                        onClick={function (event: any): void {} }
                    >

                        <FriendListComponent
                            userID={this.userID}
                            onFriendData={(data: any) => this.onFriendData(data)}
                        />

                    </CardComponent>
                </div>

            </div>

        )

    }
}

export default withAxiosPrivate(withAuth(withRouter(Profile)));
