export interface Message {
  _id?: string;
  sender: string;
  receiver: string;
  text: string;
  createdAt: string;
  seen: boolean;
  delivered: boolean;
}
