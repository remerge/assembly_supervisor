import {
  KubeConfig,
  CoreV1Api,
  BatchV1Api,
  V1OwnerReference,
  V1Job,
  V1JobCondition,
} from "@kubernetes/client-node";

const kubeConfig = new KubeConfig();
kubeConfig.loadFromDefault();

export type PodStatus = "Pending" | "Succeeded" | "Failed" | "Running";

export type Pod = {
  name: string;
  status: PodStatus;
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
};

export type Job = {
  pods: Pod[];
  status: PodStatus;
  name: string;
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
  reason?: string;
};

function getJobNameFromOwners(owners: V1OwnerReference[]): string | undefined {
  for (const owner of owners) {
    if (owner.kind === "Job") {
      return owner.name;
    }
  }
}

function finishedCondition(job: V1Job): V1JobCondition | undefined {
  if (!job.status.conditions) return;

  return job.status.conditions.find(condition => condition.status === "True");
}

export async function getJobs(): Promise<Job[]> {
  const coreClient = kubeConfig.makeApiClient(CoreV1Api);
  const batchClient = kubeConfig.makeApiClient(BatchV1Api);

  const pods = (
    await coreClient.listNamespacedPod(
      "default",
      undefined,
      false,
      undefined,
      undefined,
      undefined,
      1000,
    )
  ).body.items;

  const kubeJobs = (await batchClient.listNamespacedJob("default")).body.items;

  const jobNameToPod: { [key: string]: Pod[] } = {};

  pods.forEach(pod => {
    const jobName = getJobNameFromOwners(pod.metadata.ownerReferences);
    if (!jobName) {
      return;
    }

    let startedAt: Date | undefined;
    let finishedAt: Date | undefined;

    if (pod.status.containerStatuses && pod.status.containerStatuses.length > 0) {
      const containerStatus = pod.status.containerStatuses[0];

      if (containerStatus.state.terminated) {
        startedAt = containerStatus.state.terminated.startedAt;
        finishedAt = containerStatus.state.terminated.finishedAt;
      }

      if (containerStatus.state.running) {
        startedAt = containerStatus.state.running.startedAt;
      }
    }

    if (!jobNameToPod[jobName]) jobNameToPod[jobName] = [];

    jobNameToPod[jobName].push({
      name: pod.metadata.name,
      status: pod.status.phase as Pod["status"],
      createdAt: pod.metadata.creationTimestamp,
      startedAt,
      finishedAt,
    });
  });

  return kubeJobs.map(kubeJob => {
    const name = kubeJob.metadata.name;
    const pods = jobNameToPod[name] || [];

    let status: PodStatus = "Pending";
    let pod: Pod;
    let reason: string | undefined;

    const condition = finishedCondition(kubeJob);

    if (condition) {
      if (condition.type === "Failed") {
        status = "Failed";
        reason = condition.reason;
      } else {
        status = "Succeeded";
        pod = pods.find(pod => pod.status === "Succeeded");
      }
    } else {
      pod = pods.find(pod => pod.status === "Running");
      status = pod ? "Running" : "Pending";
    }

    return {
      name,
      status,
      pods,
      reason,
      createdAt: kubeJob.metadata.creationTimestamp,
      startedAt: pod && pod.startedAt,
      finishedAt: pod && pod.finishedAt,
    };
  });
}

function getGCPInfo(): { region: string; cluster: string } {
  const kubeCluster = kubeConfig.getCurrentCluster();
  const [, , region, cluster] = kubeCluster.name.split("_");

  return { region, cluster };
}

export function gcpPodUrl(pod: Pod): string {
  const { region, cluster } = getGCPInfo();
  return `https://console.cloud.google.com/kubernetes/pod/${region}/${cluster}/default/${pod.name}`;
}

export function gcpJobUrl(job: Job): string {
  const { region, cluster } = getGCPInfo();
  return `https://console.cloud.google.com/kubernetes/job/${region}/${cluster}/default/${job.name}`;
}
