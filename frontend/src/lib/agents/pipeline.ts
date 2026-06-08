import { runDestinationAgent } from './destinationAgent';
import { runTransportAgent } from './transportAgent';
import { runActivitiesAgent } from './activitiesAgent';
import { runBudgetAgent } from './budgetAgent';
import { runSafetyAgent } from './safetyAgent';
import { runOrchestratorAgent } from './orchestratorAgent';
import type { TripContext, TripProposal } from './types';

function addDays(date: Date, days: number): string {
    return new Date(date.getTime() + days * 86400000).toISOString().split('T')[0];
}

/**
 * Runs the full multi-agent pipeline:
 *   1. destination-agent clarifies the trip & picks/confirms the destination
 *   2. transport-agent, activities-agent and safety-agent run in parallel,
 *      each grounding itself in real search data for that destination
 *   3. budget-agent assembles real costs (using transport-agent's real flight
 *      prices + its own real lodging search) and arbitrates vs. the stated budget
 *   4. orchestrator-agent weaves everything into one cohesive proposal
 */
export async function generateTripProposal(context: TripContext): Promise<TripProposal> {
    const destination = await runDestinationAgent(context);

    const departDate = context.startDate || addDays(new Date(), 45);
    const checkin = departDate;
    const checkout = context.endDate || addDays(new Date(departDate + 'T00:00:00'), destination.nights);

    const [transport, activities, safety] = await Promise.all([
        runTransportAgent(context, destination, departDate),
        runActivitiesAgent(context, destination),
        runSafetyAgent(context, destination),
    ]);

    const budget = await runBudgetAgent(context, destination, transport, checkin, checkout);

    const summary = await runOrchestratorAgent(context, destination, transport, activities, budget, safety);

    return {
        generatedAt: new Date().toISOString(),
        originCity: context.originCity,
        destination,
        transport,
        activities,
        budget,
        safety,
        summary,
    };
}
