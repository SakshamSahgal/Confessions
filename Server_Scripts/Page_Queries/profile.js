//NEDB
const Datastore = require("nedb"); //including the nedb node package for database 
const users = new Datastore("Database/users.db");

const {Validate_Session} = require("../Auth/validate_session.js");

//Dotenv
require("dotenv").config();//reading the .env file

const fs = require("fs");

const bcrypt = require("bcrypt");

function Get_Activity_Status(Last_Activity) //function returns the activity status of a user
{
    let duration = process.env.Activity_Duration;
    console.log(duration);

    if( parseInt(parseInt(Date.now()) - parseInt(Last_Activity)) > duration )
        return "Offline";
    else
        return "Online";
}

function validate_password(str)
{
    //The minimum number of characters must be 8.
    //The string must have at least one digit.
    //The string must have at least one uppercase character.
    //The string must have at least one lowercase character.
    //The string must have at least one special character.

    if(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/.test(str))
        return "Valid Password";
    else
        return "Invalid Password";
}



function Update_Profile_Picture(req,res)
{
    Validate_Session(req).then( (Session_Result) => {
        console.log("got Session Entry = ");
        console.log(Session_Result);
        if(Session_Result.length)
        {
            if(Session_Result[0].Profile_Picture == req.body.Profile_Picture) //if already same
            {
                let verdict = {
                    Status : "Fail",
                    Description : "Profile Photo already Selected"
                }
                res.json(verdict);
            }
            else
            {
                let Updated_JSON = JSON.parse(JSON.stringify(Session_Result[0]));
                Updated_JSON.Profile_Picture = req.body.Profile_Picture;
                users.loadDatabase();

                users.update(Session_Result[0],Updated_JSON,{},(err,NumReplaced) => {

                    console.log("Profile Picture replaced = " + NumReplaced);
                    let verdict={
                        Status : "Pass",
                        Description : "Successfully Updated Profile Picture"
                    }

                    res.json(verdict);
                })
            }
        }
        else
        {
            let verdict={
                Status : "Fail",
                Description : "Invalid Session"
            }
            res.json(verdict);
        }
    })
}



function Fetch_Profile_Pictures(req,res)
{
    Validate_Session(req).then((Session_Result) => {

        if(Session_Result.length)
        {
            const files = fs.readdirSync("./Public/GUI_Resources/Profile_Pictures");

            let paths = []

            try {

                files.forEach( filename => {
                    //console.log(file);
                    this_path = "./GUI_Resources/Profile_Pictures/" + filename;
                    paths.push(this_path);
                })

                let verdict = {
                    Status : "Pass",
                    Current_Profile_Picture : Session_Result[0].Profile_Picture,
                    Paths : paths
                }

                res.json(verdict);

            }
            catch (error)
            {
                let verdict = {
                    Status : "Fail",
                    Description : "Cannot fetch files in Directory",
                }
                console.log(error);
                res.json(verdict);
            }
        }
        else
        {
            let verdict={
                Status : "Fail",
                Description : "Invalid Session"
            }
            res.json(verdict);
        }

    });
}

function Remove_Profile_Photo(req,res)
{
    Validate_Session(req).then((Session_Result) => {

        if(Session_Result.length) //If session is valid [last activity is already updated]
        {
            if(Session_Result[0].Profile_Picture == "./GUI_Resources/No_photo.gif")
            {
                let verdict={
                    Status : "Fail",
                    Description : "Profile Picture Already Removed"
                }
                res.json(verdict);
            }
            else
            {
                let Updated_JSON = JSON.parse(JSON.stringify(Session_Result[0])); //copyng matched session
                Updated_JSON.Profile_Picture = "./GUI_Resources/No_photo.gif"; //overriding the profile picture
                
                users.loadDatabase();
                users.update(Session_Result[0],Updated_JSON,{},(err,NumReplaced) => {
                    
                    console.log("Removed Profile Picture from " + NumReplaced + " Entries");
                    let verdict={
                        Status : "Pass",
                        Description : "Successfully Removed Profile Picture"
                    }            
                    res.json(verdict);
                })
            }
        }
        else
        {
            let verdict={
                Status : "Fail",
                Description : "Invalid Session"
            }
            res.json(verdict);
        }
    })
}

function Update_Bio(req,res)
{
    Validate_Session(req).then((Session_Result) => {
        if(Session_Result.length)
        {
            let Update_JSON = JSON.parse(JSON.stringify(Session_Result[0]));
            Update_JSON.Bio = req.body.Bio;
            users.loadDatabase();
            users.update(Session_Result[0],Update_JSON,{},(err,NumReplaced) => {
                console.log("No of entries Updated = " + NumReplaced);
                let verdict={
                    Status : "Pass",
                    Description : "Updated Bio Successfully"
                }
                res.json(verdict);
            })
        }
        else
        {
            let verdict={
                Status : "Fail",
                Description : "Invalid Session"
            }
            res.json(verdict);
        }
    })
}


function validate_username(str)
{
    //The number of characters must be between 5 and 15.
    //The string should only contain alphanumeric characters and/or underscores (_).
    //The first character of the string should be alphabetic.

    if(/^[A-Za-z][A-Za-z0-9_]{4,14}$/.test(str))
        return "Valid Username";
    else
        return "Invalid Username";
}


function Update_Username(req,res)
{
       Validate_Session(req).then((Session_Result) => {
         
            if(Session_Result.length) //valid Session
            {
                if(validate_username(req.body.Username) == "Valid Username") //if new username is valid
                {
                    users.loadDatabase();
                    users.find({Username : req.body.Username},(err,username_match_array) => {

                        if(username_match_array.length) //found a username match
                        {
                            let verdict={
                                Status : "Fail",
                                Description : "Username Already Exists"
                            }
                            res.json(verdict);
                        }
                        else
                        {
                            let Old_Username = Session_Result[0].Username;
                            let New_Username = req.body.Username;
                            
                            // fs.rename( "Public/Profiles/" + Old_Username + ".html" , "Public/Profiles/" + New_Username + ".html", () => { //renaming profile Page
                                
                                // console.log("Profile Page Renamed!");
                                // List all the filenames after renaming
                                
                                fs.rename("Media/" + Old_Username,"Media/" + New_Username,() => { //renaming the media directory
                                    
                                    console.log("Successfully renamed Media Directory of " + Session_Result[0].Email);
                                    
                                    let Update_JSON = JSON.parse(JSON.stringify(Session_Result[0]));
                                    Update_JSON.Username = req.body.Username;
                                    users.loadDatabase();
                                    users.update(Session_Result[0],Update_JSON,{},(err,NumReplaced) => {
                                     
                                         console.log("Updated Username of " + NumReplaced + " Entries ");      
                                         
                                         let verdict={
                                            Status : "Pass",
                                            Description : "Successfully Updated Username"
                                         }

                                         res.json(verdict);
                                
                                    })

                                })
                                
                            //   });
                        }
                    })
                }   
                else
                {
                    let verdict={
                        Status : "Fail",
                        Description : "Invalid Username"
                    }
                    res.json(verdict);
                }
            }
            else
            {
                let verdict={
                    Status : "Fail",
                    Description : "Invalid Session"
                }
                res.json(verdict);
            }
       })
}


function Update_Gender(req,res)
{
    Validate_Session(req).then((Session_Result) => {

        if(Session_Result.length) //session Exists
        {
            if(req.body.Gender == Session_Result[0].Gender)
            {
                let verdict ={
                    Status : "Fail",
                    Description : "Selection already same as previous"
                }
                res.json(verdict);
            }
            else
            {
                let Updated_JSON = JSON.parse(JSON.stringify(Session_Result[0]));
                Updated_JSON.Gender = req.body.Gender;
                users.loadDatabase();
                users.update(Session_Result[0],Updated_JSON,{},(err,NumReplaced) => {

                    console.log("Successfully Replaced gender of " + NumReplaced + " Entries");

                    let verdict ={
                        Status : "Pass",
                        Description : "Gender Updated Successfully"
                    }
                    
                    res.json(verdict);
                })
            }
            
        }
        else
        {
            let verdict={
                Status : "Fail",
                Description : "Invalid Session"
            }
            res.json(verdict);
        }

    })
}

async function Get_Buddy_Btn_Status(my_Session_JSON,His_email)
{   
    
    let ans = await new Promise((resolve, reject) => {
        
        if(my_Session_JSON.Buddies.includes(His_email))
            resolve("Remove Buddy")
        else
        {
            let Pending_Buddy_Requests_DB_Dir = "./Database/Buddy_Requests.db";
            let Pending_Buddy_Requests_DB = new Datastore(Pending_Buddy_Requests_DB_Dir);
            Pending_Buddy_Requests_DB.loadDatabase();
            Pending_Buddy_Requests_DB.find({Sender : my_Session_JSON.Email , Receiver : His_email},(err,Pending_Request_Match_Array) => {
    
                if(Pending_Request_Match_Array.length)
                    resolve("Decline Pending Buddy Request")
                else
                    resolve("Add Buddy")
            })
        }

    });
    return ans;
}

function Return_Static_Profile_Page(username,res)
{
    users.loadDatabase();
    users.find({Username : username},(err,username_match_Array) => {

        if(username_match_Array.length)
            res.send(fs.readFileSync("./Public/Profiles/profileTemplate.html","ascii"));
        else
            res.send(fs.readFileSync("./Public/invalidResource.html","ascii"));
    })
}

function Profile_Page(req,res) //function that fethces own profile page data
{
    Validate_Session(req).then((session_match_array)=>{
        
        if(session_match_array.length) //session Matched
        {
            let Posts = new Datastore("./Media/" + session_match_array[0].Username + "/posts.db");
            Posts.loadDatabase();
            Posts.find({},(err,postsArray) => {

                let postsArrayCopy = JSON.parse(JSON.stringify(postsArray));
                
                for(var i=0;i<postsArrayCopy.length;i++)
                {
                    postsArrayCopy[i].PostedBy = (postsArrayCopy[i].Visibility == "Anonymous") ? "@anonymous" : postsArrayCopy[i].PostedBy; 
                    postsArrayCopy[i].Username = (postsArrayCopy[i].Visibility == "Anonymous") ? "Anonymous" : session_match_array[0].Username; 
                    postsArrayCopy[i].Profile_Picture = (postsArrayCopy[i].Visibility == "Anonymous") ? "./GUI_Resources/anonymous2.jpg" : session_match_array[0].Profile_Picture; 
                    delete postsArrayCopy[i].Comments;
                }

                let verdict = {
                    Status : "Pass",
                    Profile_Picture : session_match_array[0].Profile_Picture,
                    Bio : (session_match_array[0].Bio == "") ? "N/A" : session_match_array[0].Bio,
                    Gender : (session_match_array[0].Gender == "") ? "Not Specified" : session_match_array[0].Gender,
                    Username : session_match_array[0].Username,
                    Posts : postsArrayCopy
                }
                res.json(verdict);
            })           
        }
        else
        {
            let verdict = {
                Status : "Fail",
                Description : "Invalid Session"
            }
            res.json(verdict);
        }

    })
}

function Fetch_Static_Profile(req,res,username) //function that fetches the static profile page data
{
    Validate_Session(req).then(Session_Result => {
        
        if(Session_Result.length) //if session is valid
        {
            if(username == Session_Result[0].Username) //if this is your own profile page
            {
                let verdict={
                    Status : "Fail",
                    Description : "You are accessing your Own Profile"
                }
                res.json(verdict);
            }
            else
            {
                users.loadDatabase();
                users.find({Username : username},(err,username_match_array) => {
                    
                    if(username_match_array.length)
                    {
                            let verdict = {
                                Status : "Pass",
                                My_Profile_Picture : Session_Result[0].Profile_Picture,
                                His_Profile_Picture : username_match_array[0].Profile_Picture,
                                Username : username_match_array[0].Username,
                                Bio : username_match_array[0].Bio,
                                Gender : username_match_array[0].Gender,
                                Email : username_match_array[0].Email,
                                Activity_Status : Get_Activity_Status(username_match_array[0].Last_Activity),
                            }

                            Get_Buddy_Btn_Status(Session_Result[0],username_match_array[0].Email).then(btn_status => {
                                
                                verdict.Buddy_Btn_Status = btn_status;
                                
                                getPosts(username,username_match_array[0].Email,username_match_array[0].Profile_Picture,Session_Result[0].Buddies).then(postsReturned => {
                                    
                                    for(var i=0;i<postsReturned.length;i++)
                                        delete postsReturned[i].Comments; //removing the comments from each post so that it can be fetched when needed
                                        
                                    verdict.Posts = postsReturned;

                                    res.json(verdict);

                                });
                                
                            })
                    }
                    else
                    {
                        let verdict={
                            Status : "Fail",
                            Description : "User Not found in DB"
                        }
                        res.json(verdict);
                    }
    
                })
            }
        }
        else
        {
            let verdict={
                Status : "Fail",
                Description : "Invalid Session"
            }
            res.json(verdict);
        }
    })
        
}

async function getPosts(hisUsername,hisEmail,hisProfilePicture,myBuddies) //function that returns his posts when i visit his profile
{
    let ans = await new Promise((resolve, reject) => {
        let hisPostsDB = new Datastore("./Media/" + hisUsername + "/posts.db");
        hisPostsDB.loadDatabase();
        hisPostsDB.find({},(err,allPostsArray) => {

            if(allPostsArray.length == 0)
                resolve([])
            else
            {
                let allPostsArrayCopy = JSON.parse(JSON.stringify(allPostsArray))
                let toViewPostsArray = []
                for(var i=0;i<allPostsArrayCopy.length;i++)
                {
                    if( (allPostsArrayCopy[i].Visibility == "Buddies-Only" && myBuddies.includes(hisEmail)) || (allPostsArrayCopy[i].Visibility == "Global" ) )
                    {
                        allPostsArrayCopy[i].Username = hisUsername;
                        allPostsArrayCopy[i].Profile_Picture = hisProfilePicture;
                        toViewPostsArray.push(allPostsArrayCopy[i])
                    }
                }

                resolve(toViewPostsArray)
            }

        })
    });
    return ans;

}


function Update_Password(req,res)
{
    console.log(req.body);
    Validate_Session(req).then((Session_Result) => {

        if(Session_Result.length) //if session is valid
        {
            bcrypt.compare(req.body.Current_Password,Session_Result[0].Password).then((IsMatched) => {

                if(IsMatched) //password matched
                {
                    console.log("Password Matched");

                    if(validate_password(req.body.New_Password) == "Valid Password") //if valid new password
                    {
                        bcrypt.hash(req.body.New_Password,10).then((hashed_password) => {
                        
                            console.log("Hashed New Password = " + hashed_password);
                            
                            let Update_JSON = JSON.parse(JSON.stringify(Session_Result[0]));
                            Update_JSON.Password = hashed_password;
                            users.loadDatabase();
                            users.update(Session_Result[0],Update_JSON,{},(err,Num_Replaced) => {
                                console.log("Entries Replaced = " + Num_Replaced);
                             
                                let verdict={
                                    Status : "Pass",
                                    Description : "Password Updated Successfully!"
                                }
                                
                                res.json(verdict);
                            })
                        })
                    }
                    else
                    {   
                        let verdict={
                            Status : "Fail",
                            Description : "Invalid Password"
                        }
                        
                        res.json(verdict);
                    }
                }
                else
                {
                    verdict = {
                        Status : "Fail",
                        Description : "Wrong Current Password"
                    }
                    res.json(verdict);
                }

            })
        }
        else
        {
            let verdict={
                Status : "Fail",
                Description : "Invalid Session"
            }
            res.json(verdict);
        }
    })
}


module.exports = {Return_Static_Profile_Page,Fetch_Static_Profile,Update_Gender,Update_Username,Update_Bio,Profile_Page,Fetch_Profile_Pictures,Update_Profile_Picture,Remove_Profile_Photo,Update_Password};