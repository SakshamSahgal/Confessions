//------------------------------------------------------------Node Packages-----------------------------------------------------

//Dotenv
require("dotenv").config();//reading the .env file

//EXPRESS
const express = require("express"); //including express package for creating a server
const app = express();
const port = process.env.DEV_PORT || 3000
app.listen(port); //function called when the server starts listening
app.use(express.static('Public')) //the public folder is what is visible to the client (actually a subset of that folder (depending on the currently rendered webpage and it's used resources))
app.use(express.json({limit : '1mb'} )); //telling that my app will be sending/recieving data in json format (limiting to 1MB)

//------------------------------------------------------------------------------------------------------------------------------

//Other Scripts
const {Register_Email,Register_Username,Verify_OTP,Register_Password} = require("./Auth/register.js");



app.post("/Register_Email_api",(request,response) => {
    Register_Email(request.body,response);
})

app.post("/Register_Username_api",(request,response) => {
    Register_Username(request.body,response);
})

app.post("/Register_OTP_api",(request,response) => {
    Verify_OTP(request.body,response);
})

app.post("/Register_Password_api",(request,response) => {
    Register_Password(request.body,response);
})