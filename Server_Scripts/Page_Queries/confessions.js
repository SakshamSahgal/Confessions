const {Validate_Session} = require("../Auth/validate_session.js");
const Datastore = require("nedb"); //including the nedb node package for database 
const fs = require("fs");
const users = new Datastore("Database/users.db");


function Confess(req_JSON,res)
{
    console.log(req_JSON);
    Validate_Session(req_JSON).then( (Session_Result) => {
        
        if(Session_Result.length)
        {
            if(req_JSON.Confession_Data.length >= 0 && req_JSON.Confession_Data.length <= 500) //if data is of correct length
            {

                users.loadDatabase();
                users.find({Email : req_JSON.Confessed_To_Email},(err,email_match_array) => {

                    if(email_match_array.length)
                    {
                        let Recipient_Dir_to_Submit_Confession = "Media/" + email_match_array[0].Username;
                        let Sender_Dir_to_Submit_Confession = "Media/" + Session_Result[0].Username;

                        console.log("Checking Recipient directory = " + Recipient_Dir_to_Submit_Confession);
                        console.log("Checking Sender's directory = " + Sender_Dir_to_Submit_Confession);

                        if(fs.existsSync(Recipient_Dir_to_Submit_Confession) && fs.existsSync(Sender_Dir_to_Submit_Confession)) //if the directorys exists
                        {
                            console.log("Both Directories Exists");

                            let Recipient_Entry_JSON = {
                                Confessed_by : Session_Result[0].Email,
                                Timestamp : Date.now(),
                                Confession : req_JSON.Confession_Data ,
                            }
                            
                            let Sender_Entry_JSON = {
                                Confessed_To : req_JSON.Confessed_To_Email,
                                Timestamp : Recipient_Entry_JSON.Timestamp,
                                Confession : req_JSON.Confession_Data ,
                            }

                            console.log("Submitting " , Recipient_Entry_JSON);
                            
                            //loading the recipient's Confessions got database
                            const Confessions_Got = new Datastore(Recipient_Dir_to_Submit_Confession + "/Confessions_Got.db");
                            Confessions_Got.loadDatabase();
                            Confessions_Got.insert(Recipient_Entry_JSON); //inserting that entry

                            //loading the Sender's Confessions sent database
                            const Confessions_Sent = new Datastore(Sender_Dir_to_Submit_Confession + "/Confessions_Sent.db");
                            Confessions_Sent.loadDatabase();
                            Confessions_Sent.insert(Sender_Entry_JSON);
                            
                            let verdict = {
                                Status : "Pass",
                                Description : "Successfully Confessed Anonymously"
                            }
                            res.json(verdict);
                        }
                        else
                        {
                            let verdict = {
                                Status : "Fail",
                                Description : "User doesn't exists"
                            }
                            res.json(verdict);
                        }
                    }
                    else
                    {
                        let verdict = {
                            Status : "Fail",
                            Description : "Email Doesnt match any users in DB"
                        }
                        res.json(verdict);
                    }

                })

            }
            else
            {
                let verdict = {
                    Status : "Fail",
                    Description : "Invalid Confession Data Length"
                }
                res.json(verdict);
            }

            let Entry_JSON = req_JSON;
            Entry_JSON.Po
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

module.exports = {Confess};