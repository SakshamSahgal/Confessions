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
const {Return_Media_DBs} = require("./Debugging_Scripts/Return_Media.js");
const {Return_Users_DB} = require("./Debugging_Scripts/Return_Users.js");
const {Fetch_All_Users} = require("./Page_Queries/users.js");
const {Profile_Page,Fetch_Profile_Pictures,Update_Profile_Picture,Remove_Profile_Photo} = require("./Page_Queries/profile.js");
const {Delete_Account} = require("./Auth/Delete_Acc.js");
const {Return_Static_Profile_Page,Fetch_Static_Profile,Update_Bio,Update_Username,Update_Gender,Update_Password} = require("./Page_Queries/profile.js");
const {FetchMoods,Fetch_Dashboard,Fetch_All_Themes,CommentPost} = require("./Page_Queries/Dashboard.js");
const {Verify_Email,Forgot_Verify_OTP,Verify_Password} = require("./Auth/Forgot_Details.js");
const {Confess,Fetch_Confessions,Fetch_Static_Confessions_Got} = require("./Page_Queries/confessions.js");
const {Reject_Buddy_Request,Buddy,Fetch_Buddy_Requests,Accept_Buddy_Request} = require("./Page_Queries/Buddies.js");
const {Post_it,deletePost,reactPost} = require("./Page_Queries/PostContent.js");
const {Return_Buddy_Request_DB} = require("./Debugging_Scripts/Return_Pending_Buddies.js");


app.put('/validate_session_api',(req,res) => { //Checks if session cookie is valid [if it is valid , it also updates the last activity]
    Validate_Session(req).then((Session_matched)=>{
        verdict = {}
        if(Session_matched.length)
        verdict.Status = "Session Matched";
        else
        verdict.Status = "Invalid Session";
        res.json(verdict);
    })
})


app.get("/Get_Buddy_Request_DB",(req,res) => {
    Return_Buddy_Request_DB(res);
})

app.get("/get_User_DB",(req,res)=>{ //only for debugging
    Return_Users_DB(res);
})

app.get("/get_Media_DBs",(req,res) => { //only for debugging [returns confession got and confession sent DB of all users]
    Return_Media_DBs(res);
})

app.post("/Register_Email_api",(request,response) => {  //for Email Stage of registering
    Register_Email(request.body,response);
})

app.put("/Register_Username_api",(request,response) => {  //for Username Stage of registering
    Register_Username(request.body,response);
})

app.put("/Register_OTP_api",(request,response) => { //for OTP Stage of registering
    Verify_OTP(request.body,response);
})

app.put("/Register_Password_api",(request,response) => { //for Password Stage of registering
    Register_Password(request.body,response);
})

app.put('/auth_api',async (req,res) => { //Authorizes user[when user logs in]
    Authorize_User(req.body,res);
})

app.put("/update_profile_picture_api",(request,response) => { //api called when user updates profile picture
    Update_Profile_Picture(request,response);
})

app.put('/logout_api',(req,res) => { //Logout user
    Logout(req,res);
})

app.get("/Fetch_Users",(req,res)=> { //Fetch all users data to be displayed on users.html
    Fetch_All_Users(req,res);
})

app.get("/Profile_Page_api",(req,res) => { //Get your own profile page information 
    Profile_Page(req,res);
})

app.delete('/Delete_Account',(req,res) => { //Deletes user account
    Delete_Account(req,res);
})

app.get("/fetch_Profile_Pictures_api",(req,res) => { //fetch all the available profile picture paths
    Fetch_Profile_Pictures(req,res);
})

app.put("/Remove_Profile_Picture_api",(req,res) => { //called when user updates profile picture in his proifle
    Remove_Profile_Photo(req,res);
})

app.put("/Update_Bio_api",(req,res) => { //called when user updates bio in his proifle
    Update_Bio(req,res);
})

app.put("/Update_Username_api",(req,res) => { //called when user updates username in his proifle
    Update_Username(req,res);
})

app.put("/Update_Gender_api",(req,res) => { //called when user updates Gender in his proifle
    Update_Gender(req,res);
})

app.get("/Profiles/:username",(req,res) => { //called when user visits someone else's profile page
   
   if(req.headers.authorization == undefined) //if accessing through link [therefore without auth header] (just returning the HTML template)
       Return_Static_Profile_Page(req.params.username,res); 
   else
       Fetch_Static_Profile(req,res,req.params.username) //then template will send a get request to fetch the data with authorization header
})

app.get("/Fetch_Dashboard_api",(req,res) => { //api fetches 
    Fetch_Dashboard(req,res);
})

app.put("/Forgot_Email_api",(req,res) => {
    Verify_Email(req.body,res);
})

app.put("/Forgot_OTP_api",(req,res) => { //api called whem user enters the OTP sent , in forget password page
    Forgot_Verify_OTP(req.body,res);
})

app.put("/Forget_Password_api",(req,res) => { //api called when user enters new password in forgot password page
    Verify_Password(req.body,res);
})

app.put("/Update_Password_api",(req,res) => { //api called when user requests to change password
    Update_Password(req,res);
})

app.post("/Confess_api",(req,res) => { //api called when someone confesses to someone else
    Confess(req,res);
})

app.get("/fetch_confessions",(req,res) => { //api called when user clicks on fetch confessions in his profile page.
    Fetch_Confessions(req,res);
})

app.get("/fetch_static_confessions/:username",(req,res) => { //api called when user clicks on view confessions in a static profile page.
    Fetch_Static_Confessions_Got(req,res,req.params.username);
})

app.put("/Buddy_api",(req,res) => { //api called when user add/remove a buddy
    Buddy(req,res); //function that handles the buddy requests
})

app.post("/Post_it_api",(req,res) => {
    Post_it(req,res);
})

app.get("/fetch_buddy_requests",(req,res) => {
    Fetch_Buddy_Requests(req,res); //function that fetches buddy requests
})

app.put("/accept_buddy_request",(req,res) => {
    Accept_Buddy_Request(req,res);
})

app.put("/reject_buddy_request",(req,res) => {
    Reject_Buddy_Request(req,res);
})

app.get("/fetch_themes",(req,res) => {
    Fetch_All_Themes(req,res);
})

app.get("/fetchMoods",(req,res) => {
    FetchMoods(req,res);
})

app.post("/postIt",(req,res) => {
    Post_it(req,res);
})

app.delete("/deletePost/:postId",(req,res) => { //post request called when user deletes a post
    deletePost(req,res);
})

app.put("/reactPost",(req,res) => { //post request called when user reacts to a post"
    reactPost(req,res);
})


app.post("/commentPost",(req,res) => {
    CommentPost(req,res);
})