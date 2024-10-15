const express = require("express")

const app = express();
const cors = require("cors")

const TokenRoute = require("./routes/token")


app.listen(5500, ()=>{
    console.log('server running');
});

app.use(express.json());
app.use(cors());

app.get("/", (req, res) =>{
    res.send('MPesa Express Running')
});

app.use("/token", TokenRoute);

