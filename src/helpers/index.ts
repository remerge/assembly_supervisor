import { PodStatus } from "../kube";

export function statusCssClass(status: PodStatus): string {
  if (status === "Succeeded") return "green";
  if (status === "Pending") return "yellow";
  if (status === "Running") return "blue";
  return "red";
}
