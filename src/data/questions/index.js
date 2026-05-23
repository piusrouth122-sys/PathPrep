import { INFOSYS_QUESTIONS } from './infosys';
import { TCS_QUESTIONS } from './tcs';
import { WIPRO_QUESTIONS } from './wipro';
import { IBM_QUESTIONS } from './ibm';

export const COMPANY_QUESTIONS = {
  Infosys: INFOSYS_QUESTIONS,
  TCS: TCS_QUESTIONS,
  Wipro: WIPRO_QUESTIONS,
  IBM: IBM_QUESTIONS,
};

// THESE ARE THE MISSING FUNCTIONS
export function getYears(company) {
  const qs = COMPANY_QUESTIONS[company];
  if (!qs) return [];
  return [...new Set(qs.map(q => q.year))].sort();
}

export function getTopics(company) {
  const qs = COMPANY_QUESTIONS[company];
  if (!qs) return [];
  return [...new Set(qs.map(q => q.topic))].sort();
}