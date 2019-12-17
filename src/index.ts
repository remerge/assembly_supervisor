import express from "express";
import path from "path";

const app = express();
const port = 8088; // default port to listen

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
// define a route handler for the default home page
app.get("/", (req, res) => {
  res.render("index");
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
