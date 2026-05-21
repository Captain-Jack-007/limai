export type { SlideType, SlidePromptContext, SlidePromptResult, PromptBuilder } from './types';
export { buildOutlineSystem, buildOutlineUser } from './outline';

import type { SlideType, SlidePromptContext, SlidePromptResult, PromptBuilder } from './types';
import { buildCoverPrompt }         from './slides/cover';
import { buildPainpointsPrompt }    from './slides/painpoints';
import { buildSolutionPrompt }      from './slides/solution';
import { buildMarketPrompt }        from './slides/market';
import { buildTractionPrompt }      from './slides/traction';
import { buildBusinessModelPrompt } from './slides/business_model';
import { buildCompetitionPrompt }   from './slides/competition';
import { buildTeamPrompt }          from './slides/team';
import { buildFinancePrompt }       from './slides/finance';
import { buildRoadmapPrompt }       from './slides/roadmap';
import { buildInvestmentPrompt }    from './slides/investment';
import { buildContactPrompt }       from './slides/contact';
import { buildDefaultPrompt }       from './slides/_default';

export {
  buildCoverPrompt,
  buildPainpointsPrompt,
  buildSolutionPrompt,
  buildMarketPrompt,
  buildTractionPrompt,
  buildBusinessModelPrompt,
  buildCompetitionPrompt,
  buildTeamPrompt,
  buildFinancePrompt,
  buildRoadmapPrompt,
  buildInvestmentPrompt,
  buildContactPrompt,
  buildDefaultPrompt,
};

const SLIDE_PROMPT_MAP: Record<SlideType, PromptBuilder> = {
  cover:          buildCoverPrompt,
  painpoints:     buildPainpointsPrompt,
  solution:       buildSolutionPrompt,
  market:         buildMarketPrompt,
  traction:       buildTractionPrompt,
  business_model: buildBusinessModelPrompt,
  competition:    buildCompetitionPrompt,
  team:           buildTeamPrompt,
  finance:        buildFinancePrompt,
  roadmap:        buildRoadmapPrompt,
  investment:     buildInvestmentPrompt,
  contact:        buildContactPrompt,
};

export function getSlidePrompt(
  slideType: string,
  ctx: SlidePromptContext,
): SlidePromptResult {
  const builder = (SLIDE_PROMPT_MAP as Record<string, PromptBuilder>)[slideType] ?? buildDefaultPrompt;
  return builder(ctx);
}
