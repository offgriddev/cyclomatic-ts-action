export type ProjectTaskData = {
  Complexity: string
  EpicLink: string
  Key: string
  total: number
  fact: number
}

export type Player = {
  name: string
  weeks: Record<number, PlayerWeek[]>
}

export type Card = {
  complexity: number
  key: string
}

export type EstimateEvidence = {
  total: number
  cards: Card[]
}

export type PlayerCardAssignment = {
  workable: number
  overage: number
}

export type PlayerWeek = {
  hours: number
  player: string
  epic: string
}

export type Estimate = {
  totalComplexity: number
  weeks: PlayerWeek[][]
}

export type Metric = {
  source: string
  complexity: number
}
