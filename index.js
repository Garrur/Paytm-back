const express = require("express");
const cors = require("cors")
require('dotenv').config();
const port = process.env.PORT || 3000
const app = express();

app.use(cors());
app.use(express.json());


const mainRouter = require("./routes/index")


app.use ("/api/v1", mainRouter);

app.listen(port, function (){
    console.log(`Listening on http://localhost:${port}`);
})


