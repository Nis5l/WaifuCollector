export interface TradeState {
  name: string;
  cards: any | undefined;
  friendcards: any | undefined;
  found: boolean;
  info: string;
  friendinfo: string;
  tradeCount: number;
  friendTradeCount: number;
  tradeLimit: number;
  tradeTime: number;
  cardSuggestions: any | undefined;
  friendCardSuggestions: any | undefined;
  confirmed: number;
  friendConfirmed: number;

  removeId: number | undefined;
  removeFriendSuggestionId: number | undefined;
  removeSuggestionId: number | undefined;

  disabled: any | undefined;
  confirmdisabled: string | undefined;

  loading: boolean;
}
