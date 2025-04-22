const express = require("express");
const cors = require("cors");
const balanceRoutes = require("./Router/routes");

const app = express();
const port = 3042;

app.use(cors());
app.use(express.json());

app.use("/", balanceRoutes);

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
