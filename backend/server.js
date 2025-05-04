require("dotenv").config();
const express = require("express");
const cors = require("cors");
const apiRouter = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 5000;



app.use(cors({
  origin: 'https://csgpt-frontend.onrender.com',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());
app.use("/api", apiRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
