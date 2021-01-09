import { Attachments } from './attachments.model';

export interface EmailPost {
  from?: string;
  to?: string[];
  subject?: string;
  text?: string;
  html?: string;
  attachments?: Attachments[];
  header?: any;
  body?: any;
  footer?: any;
}
