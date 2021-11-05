export interface Deposit {
  l1token: string;
  l2account: string;
  amount: string;
  nonce: string;
}

export interface SwapAck {
  l2account: string;
  rid: string;
}

export interface WithDraw {
  l1account: string;
  l2account: string;
  amount: string;
  nonce: string;
}
