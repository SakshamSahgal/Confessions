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
const {Authorize_User} = require("./Auth/login.js");
const {Validate_Session} = require("./Auth/validate_session.js")
const {Logout} = require("./Auth/logout.js");
const {Return_Users_DB} = require("./Debugging_Scripts/Return_Users.js");
const {Fetch_All_Users} = require("./Page_Queries/users.js");
const {Profile_Page} = require("./Page_Queries/profile.js");


app.post("/Register_Email_api",(request,response) => {  //for Email Stage of registering
    Register_Email(request.body,response);
})

app.post("/Register_Username_api",(request,response) => {  //for Username Stage of registering
    Register_Username(request.body,response);
})

app.post("/Register_OTP_api",(request,response) => { //for OTP Stage of registering
    Verify_OTP(request.body,response);
})

app.post("/Register_Password_api",(request,response) => { //for Password Stage of registering
    Register_Password(request.body,response);
})


app.get("/get_User_DB",(req,res)=>{ //only for debugging
    Return_Users_DB(res);
})

app.post('/auth_api',async (req,res) => { //Authorizes user[when user logs in]
    Authorize_User(req.body,res);
})

app.post('/validate_session_api',(req,res) => { //checks if session cookie is valid [if it is valid , it also updates the last activity]
    Validate_Session(req.body).then((Session_matched)=>{
        verdict = {}
        if(Session_matched.length)
            verdict.Status = "Session Matched";
        else
            verdict.Status = "Invalid Session";
        res.json(verdict);
    })
})

app.post('/logout_api',(req,res) => { //Logout user
    Logout(req.body.Session_ID,res);
})

app.post("/Fetch_Users",(req,res)=> { //Fetch all users data to be displayed on users.html
    Fetch_All_Users(req.body,res);
})

app.post("/Profile_Page_api",(req,res) => { //Get your own profile page information 
    Profile_Page(req.body,res);
})