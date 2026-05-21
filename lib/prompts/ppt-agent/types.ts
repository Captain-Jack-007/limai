export type SlideType =
  | 'cover'
  | 'painpoints'
  | 'solution'
  | 'market'
  | 'traction'
  | 'business_model'
  | 'competition'
  | 'team'
  | 'finance'
  | 'roadmap'
  | 'investment'
  | 'contact';

export interface SlidePromptContext {
  index: number;
  slideType: string;
  projectName: string;
  fullText: string;
  focus: string;
  title: string;
}

export interface SlidePromptResult {
  system: string;
  user: string;
}

export type PromptBuilder = (ctx: SlidePromptContext) => SlidePromptResult;
