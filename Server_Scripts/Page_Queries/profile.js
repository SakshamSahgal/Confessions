//NEDB
const Datastore = require("nedb"); //including the nedb node package for database 
const users = new Datastore("Database/users.db");

const {Validate_Session} = require("../Auth/validate_session.js");

function Profile_Page(req_JSON,res)
{
    Validate_Session(req_JSON).then((session_match_array)=>{
        
        if(session_match_array.length) //session Matched
        {
            let verdict = {
                Status : "Pass",
                Profile_Picture : session_match_array[0].Profile_Picture,
                Bio : (session_match_array[0].Bio == "") ? "N/A" : session_match_array[0].Bio,
                Gender : (session_match_array[0].Gender == "") ? "Not Specified" : session_match_array[0].Gender,
                Username : session_match_array[0].Username,
            }
            res.json(verdict);
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

function Update_Profile_Picture(req_JSON,res)
{
    Validate_Session(req_JSON).then( (Session_Result) => {
        console.log("got Session Entry = ");
        console.log(Session_Result);
        if(Session_Result.length)
        {
            if(Session_Result[0].Profile_Picture == req_JSON.Profile_Picture)
            {
                let verdict={
                    Status : "Fail",
                    Description : "Profile Photo already Selected"
                }
                res.json(verdict);
            }
            else
            {
                let Updated_JSON = JSON.parse(JSON.stringify(Session_Result[0]));
                Updated_JSON.Profile_Picture = req_JSON.Profile_Picture;
                
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


function Fetch_Profile_Pictures(Session,res)
{
        Validate_Session(Session).then((Session_Result) => {

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

function Remove_Profile_Photo(req_JSON,res)
{
    Validate_Session(req_JSON).then((Session_Result) => {

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
                let Updated_JSON = JSON.parse(JSON.stringify(Session_Result[0]));
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

function Update_Bio(req_JSON,res)
{
    Validate_Session(req_JSON).then((Session_Result) => {
        if(Session_Result.length)
        {
            let Update_JSON = JSON.parse(JSON.stringify(Session_Result[0]));
            Update_JSON.Bio = req_JSON.Bio;
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

module.exports = {Update_Bio,Profile_Page,Fetch_Profile_Pictures,Update_Profile_Picture,Remove_Profile_Photo};