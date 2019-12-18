import express from "express";
import path from "path";
import { getJobs, gcpPodUrl, gcpJobUrl, PodStatus } from "./kube";
import relativeTime from "./relativeTime";
import * as helpers from "./helpers/index";

const app = express();
const port = 8088; // default port to listen

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  const jobs = (await getJobs()).sort(
    (jobA, jobB) => jobB.createdAt.getTime() - jobA.createdAt.getTime(),
  );

  const counts: { [key in PodStatus]: number } = {
    Pending: 0,
    Running: 0,
    Failed: 0,
    Succeeded: 0,
  };

  jobs.forEach(job => {
    counts[job.status] += 1;
  });

  res.render("index", {
    jobs,
    counts,
    relativeTime,
    gcpPodUrl,
    gcpJobUrl,
    ...helpers,
  });
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
