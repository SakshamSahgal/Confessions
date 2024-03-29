const {Validate_Session} = require("../Auth/validate_session.js");
const Datastore = require("nedb"); //including the nedb node package for database 
const fs = require("fs");
const users = new Datastore("Database/users.db");


function Confess(req,res)
{
    console.log(req.body);
    Validate_Session(req).then( (Session_Result) => {
        
        if(Session_Result.length)
        {
            if(req.body.Confession_Data.length >= 0 && req.body.Confession_Data.length <= 500) //if data is of correct length
            {
                users.loadDatabase();
                users.find({Email : req.body.Confessed_To_Email},(err,email_match_array) => {

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
                                Confession : req.body.Confession_Data ,
                            }
                            
                            let Sender_Entry_JSON = {
                                Confessed_To : req.body.Confessed_To_Email,
                                Timestamp : Recipient_Entry_JSON.Timestamp,
                                Confession : req.body.Confession_Data ,
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

            let Entry_JSON = req.body;
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


function Fetch_Confessions(req,res) //fetch his confesstions data
{
    console.log(req.body);
     Validate_Session(req).then((Session_Result) => {

        if(Session_Result.length) //valid session
        {
            let dir = "Media/" + Session_Result[0].Username; //getting username directory
            if(fs.existsSync(dir)) //if user's directory exists
            {
                let verdict = {
                    Status : "Pass",
                    Confessions_Got : [],
                    Confessions_Sent : [],
                    Description : "Confessions Parsed Successfully!"
                }

                let Confessions_got_db = new Datastore(dir + "/Confessions_Got.db"); //Accessing User's Confessions got DB
                let Confessions_sent_db = new Datastore(dir + "/Confessions_Sent.db"); //Accessing User's Confessions sent DB

                Confessions_got_db.loadDatabase();

                Confessions_got_db.find({},(err,confessions_got_array) => {
                    
                    confessions_got_array.forEach(element => {
                            
                            let to_sent_JSON = {
                                Confession : element.Confession,
                                Timestamp : element.Timestamp
                            }

                            verdict.Confessions_Got.push(to_sent_JSON);
                        });

                    Confessions_sent_db.loadDatabase();

                    Confessions_sent_db.find({},(err,confessions_sent_array) => {

                        if(confessions_sent_array.length == 0)
                            res.json(verdict);
                        
                        confessions_sent_array.forEach(element => {
                            
                            users.loadDatabase(); //loading the database to get corresponding username of each email ID
                            users.find({Email : element.Confessed_To},(err,Email_match_array) => { //getting the username from the email of the recipient

                                let to_send_JSON = {
                                    Confession : element.Confession,
                                    Timestamp : element.Timestamp,
                                    Confessed_To : Email_match_array[0].Username
                                }

                                console.log(to_send_JSON);
                                verdict.Confessions_Sent.push(to_send_JSON);

                                if(verdict.Confessions_Sent.length == confessions_sent_array.length) //if iterations ends
                                    res.json(verdict);

                            })

                        });


                    })

                })
            }
            else
            {
                let verdict={
                    Status : "Pass",
                    Description : "User Directory Doesn't Exist"
                }
                res.json(verdict);
            }
        }
        else
        {
            let verdict = {
                Status : "Pass",
                Description : "Invalid Session"
            }
            res.json(verdict);
        }

     });

}

function Fetch_Static_Confessions_Got(req,res,Username_To_Fetch)
{
    Validate_Session(req).then((Session_Result) => {
        if(Session_Result.length)
        {
            let dir = "Media/" + Username_To_Fetch;
            if(fs.existsSync(dir))
            {
                console.log("Direcory Exists");
                let confessions_got_of_this_user = new Datastore(dir + "/Confessions_Got.db");
                confessions_got_of_this_user.loadDatabase();
                
                let verdict = {
                    Status : "Pass",
                    Confessions_Got_array : [],
                    Description : "Successfully Fetched Data"
                }

                confessions_got_of_this_user.find({},(err,confessions_got_array) => {
                    
                    confessions_got_array.forEach(element => {

                        let to_send_JSON = {
                            Timestamp : element.Timestamp,
                            Confession : element.Confession
                        }

                        verdict.Confessions_Got_array.push(to_send_JSON);
                    })

                    res.json(verdict);
                })
            }
            else
            {
                let verdict = {
                    Status : "Fail",
                    Description : "Username Doesn't Exists"
                }
                res.json(verdict);
            }
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


module.exports = {Confess,Fetch_Confessions,Fetch_Static_Confessions_Got};