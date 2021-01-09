export interface BoxEmailMV {
  contents?: ContentsMV[];
}

export interface ContentsMV {
  htmls?: string[];
  isHtml?: boolean;
  panels?: Panel[];
  isPanel?: boolean;
  panelStyle?: any;
}

export interface Panel {
  title?: string;
  description?: string;
  body?: string;
}
