//NEDB
const Datastore = require("nedb"); //including the nedb node package for database 
const users = new Datastore("Database/users.db");

const {Validate_Session} = require("../Auth/validate_session.js");

function Profile_Page(req_JSON,res)
{
    Validate_Session(req_JSON).then((session_match_array)=>{
        
        if(session_match_array.length) //session Matched
        {
            let verdict={
                Status : "Pass",
                Profile_Picture : session_match_array[0].Profile_Picture,
                Bio : session_match_array[0].Bio,
                Gender : session_match_array[0].Gender,
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


module.exports = {Profile_Page};