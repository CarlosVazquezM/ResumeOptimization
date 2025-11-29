export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'groq' | 'grok'

export interface AIModel {
  id: string
  name: string
  provider: AIProvider
  costPer1kTokens: number
  enabled: boolean
}

export interface AIProviderConfig {
  id: AIProvider
  name: string
  endpoint: string
  models: AIModel[]
  requiresApiKey: boolean
}

export interface OptimizationStrategy {
  id: string
  name: string
  description: string
  steps: number
  models: string[]
  estimatedCost: number
  estimatedTime: number
  qualityScore: number
  difficulty: 'easy' | 'medium' | 'hard'
  recommended: boolean
}

export const OPTIMIZATION_STRATEGIES: OptimizationStrategy[] = [
  {
    id: 'quick-optimize',
    name: 'Quick Optimize',
    description: 'Fast single-pass optimization using Groq Mixtral',
    steps: 1,
    models: ['groq-mixtral-8x7b'],
    estimatedCost: 0.0007,
    estimatedTime: 7,
    qualityScore: 6.5,
    difficulty: 'easy',
    recommended: false,
  },
  {
    id: 'budget-optimizer',
    name: 'Budget Optimizer',
    description: 'Cost-effective two-step optimization',
    steps: 2,
    models: ['groq-mixtral-8x7b', 'deepseek-chat'],
    estimatedCost: 0.004,
    estimatedTime: 20,
    qualityScore: 7.2,
    difficulty: 'easy',
    recommended: false,
  },
  {
    id: 'cascade-refinement',
    name: 'Cascade Refinement',
    description: 'Three-tier progressive enhancement (Recommended)',
    steps: 3,
    models: ['groq-mixtral-8x7b', 'gpt-4-turbo', 'claude-sonnet-4'],
    estimatedCost: 0.048,
    estimatedTime: 45,
    qualityScore: 8.5,
    difficulty: 'medium',
    recommended: true,
  },
  {
    id: 'specialized-pipeline',
    name: 'Specialized Pipeline',
    description: 'Four-step specialized approach: Analyze → Strategize → Write → Edit',
    steps: 4,
    models: ['groq-mixtral-8x7b', 'claude-sonnet-4', 'gpt-4-turbo', 'deepseek-chat'],
    estimatedCost: 0.063,
    estimatedTime: 70,
    qualityScore: 8.7,
    difficulty: 'medium',
    recommended: false,
  },
  {
    id: 'adversarial-review',
    name: 'Adversarial Review',
    description: 'GPT-4 and Claude collaborate through critique and revision',
    steps: 4,
    models: ['gpt-4-turbo', 'claude-sonnet-4'],
    estimatedCost: 0.085,
    estimatedTime: 60,
    qualityScore: 8.8,
    difficulty: 'medium',
    recommended: false,
  },
  {
    id: 'parallel-ensemble',
    name: 'Parallel Ensemble',
    description: 'Premium: Three models work in parallel, synthesized by Claude Opus',
    steps: 4,
    models: ['claude-sonnet-4', 'gpt-4-turbo', 'gemini-pro', 'claude-opus-4'],
    estimatedCost: 0.155,
    estimatedTime: 75,
    qualityScore: 9.5,
    difficulty: 'hard',
    recommended: false,
  },
  {
    id: 'voting-consensus',
    name: 'Voting Consensus',
    description: 'Three models create versions, Claude Opus judges the best',
    steps: 4,
    models: ['gpt-4-turbo', 'claude-sonnet-4', 'gemini-pro', 'claude-opus-4'],
    estimatedCost: 0.170,
    estimatedTime: 85,
    qualityScore: 9.3,
    difficulty: 'hard',
    recommended: false,
  },
]
