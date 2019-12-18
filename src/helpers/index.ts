import { PodStatus, Pod } from "../kube";
import relativeTime from "../relativeTime";

export function statusCssClass(status: PodStatus): string {
  if (status === "Succeeded") return "green";
  if (status === "Pending") return "orange";
  if (status === "Running") return "blue";
  return "red";
}

export function tooltipForPod(pod: Pod): string {
  return `${pod.name} (Created ${relativeTime(pod.createdAt)}): Click to view in GCP`;
}
