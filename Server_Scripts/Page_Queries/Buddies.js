const {Validate_Session} = require("../Auth/validate_session.js");
const Datastore = require("nedb"); //including the nedb node package for database 
let users = new Datastore("Database/users.db");

function validate_email(str)
{
    let regex = new RegExp("([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])");

    if(regex.test(str))
        return "Valid Email";
    else
        return "Invalid Email";
}




function Buddy(req,res)
{
    Validate_Session(req).then( (Session_Result) => {

        if(Session_Result.length) //if session is valid
        {
            if(validate_email(req.body.Buddied_Email) == "Valid Email") //If Buddied email is valid
            {
                if(req.body.Buddied_Email != Session_Result[0].Email) //not my own email
                {  
                    users.loadDatabase();
                    users.find({Email : req.body.Buddied_Email},(err,email_matched_array) => { //Finding the email in the users db

                        if(email_matched_array.length) //Email matched someone [someone with this email exists]
                        {
                            if(Session_Result[0].Buddies.includes(req.body.Buddied_Email)) //The users is already my buddy
                            {
                                let Updated_JSON = JSON.parse(JSON.stringify(Session_Result[0])); //copying the JSON
                                Updated_JSON.Buddies.splice(Updated_JSON.Buddies.indexOf(req.body.Buddied_Email),1); //removing the buddy
                                
                                let users = new Datastore("Database/users.db"); //accessing the users db
                                users.loadDatabase(); //loading the db

                                users.update(Session_Result[0],Updated_JSON,{},(err,NumReplaced) => { //Updating the users db

                                    console.log("Sucessfully Replaced " + NumReplaced + " Entries hence removed his email from my buddy list");
                                                                            
                                        if(email_matched_array.length) //if he exists
                                        {
                                            let his_who_buddied_me_db_dir = "./Media/" + email_matched_array[0].Username + "/Who_Buddied_Me.db"; //accessing his who buddied me db directory
                                            let his_who_buddied_me_db = new Datastore(his_who_buddied_me_db_dir); //accessing his who buddied me db

                                            his_who_buddied_me_db.loadDatabase(); //loading his who buddied me db
                                            his_who_buddied_me_db.remove({Email : Session_Result[0].Email},{},(err,num_removed) => { //Removing my email from his who buddied me db
                                                console.log("Sucessfully removed my email from his Who_Buddied_Me.db");
                                                let verdict = {
                                                    Status : "Pass",
                                                    Description : "Successfully Un-Buddied"
                                                }
                                                res.json(verdict);
                                            })
                                        }
                                        else
                                        {
                                            let verdict = {
                                                Status : "Fail",
                                                Description : "Person Doesn't Exists"
                                            }
                                            res.json(verdict);
                                        }
                                })
                            }
                            else //The user is not already my buddy
                            {
                                let Buddy_Requests_DB_Dir = "./Database/Buddy_Requests.db"; //accessing the buddy requests db directory
                                let Buddy_Requests_DB = new Datastore(Buddy_Requests_DB_Dir); //accessing the buddy requests db
                                Buddy_Requests_DB.loadDatabase(); //loading the buddy requests db
                                
                                Buddy_Requests_DB.find({Sender : Session_Result[0].Email , Receiver : req.body.Buddied_Email},(err,Pending_Request_Match_Array) => { //finding if buddy request is pending
                                    
                                    if(Pending_Request_Match_Array.length) //if buddy request is already pending
                                    {
                                        console.log("Buddy Request is Pending");
                                        Buddy_Requests_DB.loadDatabase();  //loading the buddy requests db
                                        Buddy_Requests_DB.remove(Pending_Request_Match_Array[0],{multi : true},(err,num_removed) => { //removing the buddy request

                                            console.log("Sucessfully Removed the Pending Buddy Request");

                                            let verdict={
                                                Status : "Pass",
                                                Description : "Successfully Removed the Pending Buddy Request"
                                            }
                                            res.json(verdict);
                                        })
                                    }
                                    else
                                    {
                                        let Buddy_Req_JSON = {
                                            Sender : Session_Result[0].Email,
                                            Receiver : req.body.Buddied_Email,
                                            Timestamp : Date.now() //buddy request timestamp
                                        }
                                        Buddy_Requests_DB.loadDatabase(); //loading the buddy requests db
                                        Buddy_Requests_DB.insert(Buddy_Req_JSON,(err,NewDoc) => {  //inserting the buddy request
                                        
                                            console.log("Sucessfully Inserted the Buddy Request");
                                            
                                            let verdict={
                                                Status : "Pass",
                                                Description : "Buddy request sent"
                                            }
                                            
                                            res.json(verdict);
                                        })
                                    }
                                })
                            }
                        }
                        else
                        {
                            let verdict = {
                                Status : "Fail",
                                Description : "Person Doesnt Exists"
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
                    Description : "Invalid Buddied Email"
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

function Fetch_Buddy_Requests(req,res) //fetch all buddy requests with you as a reciever
{
    Validate_Session(req).then( (Session_Result) => {

        if(Session_Result.length) //if session is valid
        {
            let Buddy_Requests_DB_Dir = "./Database/Buddy_Requests.db"; //accessing the buddy requests db directory
            let Buddy_Requests_DB = new Datastore(Buddy_Requests_DB_Dir); //accessing the buddy requests db
            Buddy_Requests_DB.loadDatabase(); //loading the buddy requests db
            Buddy_Requests_DB.find({Receiver : Session_Result[0].Email},(err,Buddy_Requests_Array) => { //Finding the buddy requests

                    if(Buddy_Requests_Array.length == 0) //if no buddy requests
                    {
                        let verdict = {
                            Status : "Pass",
                            Buddy_Requests : Buddy_Requests_Array
                        }
                        res.json(verdict);                
                    }
                    else
                    {
                        let Buddy_Array = []
                        Buddy_Requests_Array.forEach(element => { //iterating over each buddy request with me as a Receiver
                            users.loadDatabase(); //loading the users db
                            users.find({Email : element.Sender},(err,Sender_Array) => { //Finding the username of the sender from his email
                                
                                let this_obj = JSON.parse(JSON.stringify(element)); //copying the element json
                                delete this_obj.Receiver;
                                //renaming Sender to Sender Email
                                this_obj.Sender_Email = this_obj.Sender;
                                
                                delete this_obj.Sender;
                                delete this_obj._id;

                                if(Sender_Array.length)
                                    this_obj.Sender_Username = Sender_Array[0].Username;
                                else
                                    this_obj.Sender_Username = "Unknown";

                                Buddy_Array.push(this_obj);

                                if(Buddy_Array.length == Buddy_Requests_Array.length)
                                {
                                    let verdict = {
                                        Status : "Pass",
                                        Buddy_Requests : Buddy_Array
                                    }
                                    res.json(verdict);
                                }
                            })
                        });
                    }
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

function Accept_Buddy_Request(req,res) 
{
    Validate_Session(req).then( (Session_Result) => {

        if(Session_Result.length) //if session is valid
        {
            let Buddy_Requests_DB_Dir = "./Database/Buddy_Requests.db"; //accessing the buddy requests db directory
            let Buddy_Requests_DB = new Datastore(Buddy_Requests_DB_Dir); //accessing the buddy requests db
            Buddy_Requests_DB.loadDatabase(); //loading the buddy requests db
            Buddy_Requests_DB.find({Receiver : Session_Result[0].Email , Sender : req.body.Sender},(err,Buddy_Req_Array) => { //finding the buddy request

                if(Buddy_Req_Array.length) //if buddy request exists
                {
                    let Buddy_Req = Buddy_Req_Array[0];
                    Buddy_Requests_DB.remove(Buddy_Req,{multi : true},(err,num_removed) => { //removing the buddy request

                        console.log("Sucessfully Removed his pending Buddy Request from DB"); //removed the pending buddy request from Buddy_Requests_DB

                        users.loadDatabase(); //loading the users db
                        users.find({Email : Buddy_Req.Sender},(err,Sender_Match_Array) => { //finding the sender from his email
                            if(Sender_Match_Array.length) //if sender exists
                            {   
                                if(Sender_Match_Array[0].Buddies.includes(Session_Result[0].Email) == false)   //if sender doesn't already has me in his buddy list
                                {
                                    let Updated_JSON = JSON.parse(JSON.stringify(Sender_Match_Array[0]));
                                    Updated_JSON.Buddies.push(Session_Result[0].Email); //Adding the My Email to the sender's buddy list
                                    users.update(Sender_Match_Array[0],Updated_JSON,(err,num_replaced) => { //updating the sender's buddy list
                                        console.log("Sucessfully Updated the Sender's Buddy List");
                                        
                                        let my_Who_Buddied_Me_DB_Dir = "./Media/" + Session_Result[0].Username + "/Who_Buddied_Me.db"; //accessing my who buddied me db directory
                                        my_Who_Buddied_Me_DB = new Datastore(my_Who_Buddied_Me_DB_Dir); //accessing my who buddied me db
                                        my_Who_Buddied_Me_DB.loadDatabase(); //loading my who buddied me db
                                        
                                        let JSON_To_Insert = {
                                            Email : req.body.Sender,
                                        }
                                        
                                        my_Who_Buddied_Me_DB.insert(JSON_To_Insert,(err,NewDoc) => { //inserting the sender's email in my who buddied me db
                                        
                                            console.log("Sucessfully Inserted the Sender's Email in my Who Buddied Me DB");

                                            let verdict = {
                                                Status : "Pass",
                                                Description : "Buddy Request Accepted"
                                            }
                                            res.json(verdict);
                                        })
                                    })
                                }
                                else
                                {
                                    let verdict = {
                                        Status : "Fail",
                                        Description : "You are already Buddies"
                                    }
                                    res.json(verdict);
                                }
                            }
                            else
                            {
                                let verdict = {
                                    Status : "Fail",
                                    Description : "Sender Doesn't Exists"
                                }
                                res.json(verdict);
                            }
                        })
                    })
                }
                else
                {
                    let verdict = {
                        Status : "Fail",
                        Description : "Pending Buddy Request Doesn't Exists"
                    }
                    res.json(verdict);
                }
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

function Reject_Buddy_Request(req,res)
{
    Validate_Session(req).then(Session_Result => {

        if(Session_Result.length)
        {
            let Buddy_Requests_DB_Dir = "./Database/Buddy_Requests.db"; //accessing the buddy requests db directory
            let Buddy_Requests_DB = new Datastore(Buddy_Requests_DB_Dir); //accessing the buddy requests db
            Buddy_Requests_DB.loadDatabase();
            Buddy_Requests_DB.find({Receiver : Session_Result[0].Email, Sender : req.body.Sender_Email },(err,Buddy_Match_Array) => {
                
                if(Buddy_Match_Array.length)
                {
                    Buddy_Requests_DB.remove(Buddy_Match_Array[0],(err,num_removed) => {

                        console.log("Successfully Removed " + num_removed + " Entries");
                        let verdict = {
                            Status : "Success",
                            Description : "Successfully Rejected Buddy Request"
                        }
                        res.json(verdict)
                    })
                }
                else
                {
                    let verdict = {
                        Status : "Fail",
                        Description : "No Such Buddy Request"
                    }
                    res.json(verdict);
                }

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

module.exports = {Reject_Buddy_Request,Buddy,Fetch_Buddy_Requests,Accept_Buddy_Request}