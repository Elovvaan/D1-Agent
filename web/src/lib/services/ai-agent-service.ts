import { randomUUID } from "node:crypto";
import { appendUserState, readJsonSync, userStatePath } from "@/lib/data/platform-storage";

export type AgentKey = "scout" | "recruiting" | "media" | "training" | "opportunity";
export type AgentStatus = "active" | "waiting" | "review" | "paused";
export type AgentActivityType = "found" | "generated" | "matched" | "updated" | "recommended" | "queued";

export type AiAgent = {
  id: string;
  key: AgentKey;
  name: string;
  status: AgentStatus;
  currentTask: string;
  lastCompletedTask: string;
  nextRecommendation: string;
  updatedAt: string;
};

export type AgentActivity = {
  id: string;
  agentKey: AgentKey;
  agentName: string;
  type: AgentActivityType;
  message: string;
  target?: string;
  status: "new" | "review" | "approved" | "archived";
  createdAt: string;
};

export type AgentRecommendation = {
  id: string;
  agentKey: AgentKey;
  agentName: string;
  title: string;
  recommendation: string;
  priority: "low" | "medium" | "high";
  status: "open" | "accepted" | "dismissed";
  createdAt: string;
};

const AI_AGENTS_FILE = "ai-agents.json";
const AGENT_ACTIVITY_FILE = "agent-activity.json";
const AGENT_RECOMMENDATIONS_FILE = "agent-recommendations.json";

const defaultAgents: AiAgent[] = [
  { id: "agent-scout", key: "scout", name: "Scout Agent", status: "active", currentTask: "Watching local tournaments and event opportunities.", lastCompletedTask: "Found two tournament leads for review.", nextRecommendation: "Review the tournament matches and choose which ones fit the athlete path.", updatedAt: "default" },
  { id: "agent-recruiting", key: "recruiting", name: "Recruiting Agent", status: "review", currentTask: "Checking college fit signals and recruiting profile strength.", lastCompletedTask: "Updated college fit scores.", nextRecommendation: "Add recent film and confirm academic details before outreach.", updatedAt: "default" },
  { id: "agent-media", key: "media", name: "Media Agent", status: "active", currentTask: "Reviewing connected media for highlight opportunities.", lastCompletedTask: "Generated three highlight clip candidates.", nextRecommendation: "Approve the best clip before publishing it to the profile.", updatedAt: "default" },
  { id: "agent-training", key: "training", name: "Training Agent", status: "waiting", currentTask: "Reading performance and check-in data.", lastCompletedTask: "Recommended improving lateral speed.", nextRecommendation: "Add a lateral speed drill block to this week's training plan.", updatedAt: "default" },
  { id: "agent-opportunity", key: "opportunity", name: "Opportunity Agent", status: "active", currentTask: "Matching showcases, camps, leagues, and local events.", lastCompletedTask: "Matched one showcase opportunity.", nextRecommendation: "Check schedule fit and decide whether to register.", updatedAt: "default" }
];

const defaultActivity: AgentActivity[] = [
  { id: "activity-scout-default", agentKey: "scout", agentName: "Scout Agent", type: "found", message: "Scout Agent found two tournaments.", target: "Tournament leads", status: "new", createdAt: "default" },
  { id: "activity-media-default", agentKey: "media", agentName: "Media Agent", type: "generated", message: "Media Agent generated three highlight clips.", target: "Highlight clips", status: "review", createdAt: "default" },
  { id: "activity-opportunity-default", agentKey: "opportunity", agentName: "Opportunity Agent", type: "matched", message: "Opportunity Agent matched one showcase.", target: "Showcase match", status: "new", createdAt: "default" },
  { id: "activity-recruiting-default", agentKey: "recruiting", agentName: "Recruiting Agent", type: "updated", message: "Recruiting Agent updated college fit scores.", target: "College fit", status: "review", createdAt: "default" },
  { id: "activity-training-default", agentKey: "training", agentName: "Training Agent", type: "recommended", message: "Training Agent recommended improving lateral speed.", target: "Training plan", status: "new", createdAt: "default" }
];

function readItems<T>(fileName: string) {
  return readJsonSync<{ items?: T[] }>(userStatePath(fileName), { items: [] }).items ?? [];
}

function now() {
  return new Date().toISOString();
}

export function getAiAgents() {
  const stored = readItems<AiAgent>(AI_AGENTS_FILE);
  const byKey = new Map<AgentKey, AiAgent>();
  for (const item of stored) byKey.set(item.key, item);
  for (const agent of defaultAgents) if (!byKey.has(agent.key)) byKey.set(agent.key, agent);
  return Array.from(byKey.values());
}

export function getAgentActivity() {
  const stored = readItems<AgentActivity>(AGENT_ACTIVITY_FILE);
  return [...stored, ...defaultActivity].slice(0, 50);
}

export function getAgentRecommendations() {
  return readItems<AgentRecommendation>(AGENT_RECOMMENDATIONS_FILE);
}

export function getAiAgentDashboard() {
  const agents = getAiAgents();
  const activity = getAgentActivity();
  const recommendations = getAgentRecommendations();
  return {
    agents,
    activity,
    recommendations,
    totals: {
      agents: agents.length,
      active: agents.filter((item) => item.status === "active").length,
      review: agents.filter((item) => item.status === "review").length,
      recommendations: recommendations.filter((item) => item.status === "open").length,
      activity: activity.length
    }
  };
}

export async function recordAgentActivity(input: { agentKey: AgentKey; type: AgentActivityType; message: string; target?: string }) {
  const agent = defaultAgents.find((item) => item.key === input.agentKey);
  const entry: AgentActivity = {
    id: `agent-activity-${randomUUID()}`,
    agentKey: input.agentKey,
    agentName: agent?.name || "AI Agent",
    type: input.type,
    message: input.message,
    target: input.target,
    status: "new",
    createdAt: now()
  };
  await appendUserState(AGENT_ACTIVITY_FILE, entry, 1000);
  return entry;
}

export async function updateAgentTask(input: { agentKey: AgentKey; currentTask: string; lastCompletedTask: string; nextRecommendation: string; status?: AgentStatus }) {
  const agent = defaultAgents.find((item) => item.key === input.agentKey);
  const entry: AiAgent = {
    id: agent?.id || `agent-${input.agentKey}`,
    key: input.agentKey,
    name: agent?.name || "AI Agent",
    status: input.status || "active",
    currentTask: input.currentTask,
    lastCompletedTask: input.lastCompletedTask,
    nextRecommendation: input.nextRecommendation,
    updatedAt: now()
  };
  await appendUserState(AI_AGENTS_FILE, entry, 1000);
  return entry;
}

export async function createAgentRecommendation(input: { agentKey: AgentKey; title: string; recommendation: string; priority?: "low" | "medium" | "high" }) {
  const agent = defaultAgents.find((item) => item.key === input.agentKey);
  const entry: AgentRecommendation = {
    id: `agent-recommendation-${randomUUID()}`,
    agentKey: input.agentKey,
    agentName: agent?.name || "AI Agent",
    title: input.title,
    recommendation: input.recommendation,
    priority: input.priority || "medium",
    status: "open",
    createdAt: now()
  };
  await appendUserState(AGENT_RECOMMENDATIONS_FILE, entry, 1000);
  return entry;
}
