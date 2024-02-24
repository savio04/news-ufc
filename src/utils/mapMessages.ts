import { Origins } from "./constants";

export interface IMapMessages {
  id: string;
  title: string;
  date: string;
  link: string;
}

export function mapMessages(origin: Origins, data: IMapMessages[]) {
  return data.map(
    (item) => `*📰 Noticía* 
    
*📕 Titulo:* ${item.title}

*🕜 Data:* ${item.date}

*🔗 Link:* ${item.link}`,
  );
}
