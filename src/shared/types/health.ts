/** Network health scoring model. Scores are 0-100. */

export type HealthGrade = 'excellent' | 'good' | 'fair' | 'poor' | 'critical'

export type HealthComponentKey =
  | 'connectivity'
  | 'dns'
  | 'packetLoss'
  | 'latency'
  | 'speed'

export interface HealthComponent {
  readonly key: HealthComponentKey
  readonly labelBn: string
  /** 0-100 sub-score for this dimension. */
  readonly score: number
  /** Relative weight in the overall score (weights sum to 1). */
  readonly weight: number
  /** Whether this dimension could be measured at all. */
  readonly measured: boolean
}

export interface HealthScore {
  readonly overall: number
  readonly grade: HealthGrade
  readonly components: readonly HealthComponent[]
}
