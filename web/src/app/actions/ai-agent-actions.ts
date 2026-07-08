"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAgentRecommendation, recordAgentActivity, updateAgentTask, type AgentActivityType, type AgentKey, type AgentStatus } from "@/lib/services/ai-agent-service";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function agentKey(formData: FormData): AgentKey {
  const key = value(formData, "agentKey");
  if (["scout", "recruiting", "media", "training", "opportunity"].includes(key)) return key as AgentKey;
  return "scout";
}

function activityType(formData: FormData): AgentActivityType {
  const type = value(formData, "type");
  if (["found", "generated", "matched", "updated", "recommended", "queued"].includes(type)) return type as AgentActivityType;
  return "queued";
}

function statusValue(formData: FormData): AgentStatus {
  const status = value(formData, "status");
  if (["active", "waiting", "review", "paused"].includes(status)) return status as AgentStatus;
  return "active";
}

export async function addAgentActivity(formData: FormData) {
  await recordAgentActivity({
    agentKey: agentKey(formData),
    type: activityType(formData),
    message: value(formData, "message"),
    target: value(formData, "target")
  });
  revalidatePath("/ai-team");
  revalidatePath("/operations/agent-activity");
  redirect("/operations/agent-activity?status=activity-added");
}

export async function saveAgentTask(formData: FormData) {
  await updateAgentTask({
    agentKey: agentKey(formData),
    currentTask: value(formData, "currentTask"),
    lastCompletedTask: value(formData, "lastCompletedTask"),
    nextRecommendation: value(formData, "nextRecommendation"),
    status: statusValue(formData)
  });
  revalidatePath("/ai-team");
  revalidatePath("/operations/agent-activity");
  redirect("/operations/agent-activity?status=agent-updated");
}

export async function addAgentRecommendation(formData: FormData) {
  const priority = value(formData, "priority");
  await createAgentRecommendation({
    agentKey: agentKey(formData),
    title: value(formData, "title"),
    recommendation: value(formData, "recommendation"),
    priority: priority === "high" || priority === "low" ? priority : "medium"
  });
  revalidatePath("/ai-team");
  revalidatePath("/operations/agent-activity");
  redirect("/operations/agent-activity?status=recommendation-added");
}
