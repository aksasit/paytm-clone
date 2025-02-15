const express = require("express");
const cors = require("cors")
const rootRouter = require("./routes/index")
  
const app = express();

// Starting with specific route should go to the rootRouter
app.use(cors())
app.use(express.json())
app.use("/api/v1", rootRouter)

 
app.listen(3000)
