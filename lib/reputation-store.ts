type ReputationState = {
  paymentsSent: number
  paymentsReceived: number
  successfulPayments: number
  failedPayments: number
  messagesSent: number
  messagesReceived: number
  negotiationWins: number
}

export type ReputationSnapshot = ReputationState & {
  agentId: string
  score: number
  updatedAt: number
}

class ReputationStore {
  private states = new Map<string, ReputationState>()

  private ensure(agentId: string): ReputationState {
    const current = this.states.get(agentId)
    if (current) return current
    const base: ReputationState = {
      paymentsSent: 0,
      paymentsReceived: 0,
      successfulPayments: 0,
      failedPayments: 0,
      messagesSent: 0,
      messagesReceived: 0,
      negotiationWins: 0,
    }
    this.states.set(agentId, base)
    return base
  }

  recordPayment(from: string, to: string, success: boolean) {
    const sender = this.ensure(from)
    const receiver = this.ensure(to)

    sender.paymentsSent += 1
    receiver.paymentsReceived += 1

    if (success) {
      sender.successfulPayments += 1
      receiver.successfulPayments += 1
    } else {
      sender.failedPayments += 1
      receiver.failedPayments += 1
    }
  }

  recordMessage(from: string, to: string) {
    const sender = this.ensure(from)
    const receiver = this.ensure(to)
    sender.messagesSent += 1
    receiver.messagesReceived += 1
  }

  recordNegotiationWin(agentId: string) {
    const state = this.ensure(agentId)
    state.negotiationWins += 1
  }

  get(agentId: string): ReputationSnapshot {
    const state = this.ensure(agentId)
    const totalPayments = state.successfulPayments + state.failedPayments
    const successRate = totalPayments > 0 ? state.successfulPayments / totalPayments : 1
    const activity = Math.min((state.messagesSent + state.messagesReceived + totalPayments) / 50, 1)
    const negotiationBonus = Math.min(state.negotiationWins * 0.03, 0.15)

    const score = Math.max(
      0,
      Math.min(5, 2.5 + successRate * 1.8 + activity * 0.5 + negotiationBonus - state.failedPayments * 0.05)
    )

    return {
      agentId,
      ...state,
      score: Number(score.toFixed(2)),
      updatedAt: Date.now(),
    }
  }

  list(agentIds: string[]): ReputationSnapshot[] {
    return agentIds.map((id) => this.get(id))
  }
}

const globalRepStore = globalThis as unknown as { __agentlinkReputationStore?: ReputationStore }

export const reputationStore = globalRepStore.__agentlinkReputationStore ?? new ReputationStore()

if (!globalRepStore.__agentlinkReputationStore) {
  globalRepStore.__agentlinkReputationStore = reputationStore
}
