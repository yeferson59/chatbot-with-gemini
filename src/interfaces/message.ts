export interface Message {
  sender: "user" | "bot";
  image?: string;
  text: string;
}
