//NEDB
const Datastore = require("nedb"); //including the nedb node package for database 
const users = new Datastore("Database/users.db");
const {Validate_Session} = require("../Auth/validate_session.js");

function Logout(req,res)
{
    Validate_Session(req).then(session_match_array => {

        if(session_match_array.length)
        {
            users.loadDatabase();
            users.find({"Session.Session_ID" : req.headers.authorization},(err,user_matched_array)=>{
                
                console.log("Found = ");
                console.log(user_matched_array);

                let verdict = {
                }

                if(user_matched_array.length == 0) //User has already logged Out/Invalid Session
                {
                    let verdict = {
                        Status : "Fail",
                        Description : "User already logged out or Invalid Session"
                    }

                    res.json(verdict);
                }
                else
                {
                        let Updated_JSON = JSON.parse(JSON.stringify(user_matched_array[0]));

                        for(var i=0;i < Updated_JSON.Session.length;i++) //find that session_ID
                        {
                            if(Updated_JSON.Session[i].Session_ID == String(req.headers.authorization))
                            {
                                console.log("index = " + i);
                                Updated_JSON.Session.splice(i,1); // 2nd parameter means remove one item only
                                break
                            }
                        }
                        
                        users.update(user_matched_array[0],Updated_JSON,{},(err,Num_Replaced) => {
                            
                            console.log("No of elements replaced = " + Num_Replaced);

                            verdict.Status = "Pass";
                            verdict.Description = "User successfully Logged out";
                            res.json(verdict);
                        })  
                }
            });
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

module.exports = {Logout};