const {Validate_Session} = require("../Auth/validate_session.js");
const Datastore = require("nedb"); //including the nedb node package for database 
const { json } = require("express");


function validate_email(str)
{
    let regex = new RegExp("([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])");

    if(regex.test(str))
        return "Valid Email";
    else
        return "Invalid Email";
}


// function Add_Buddies(req_JSON,res) {
    
//     Validate_Session(req_JSON).then((Session_Result) => {

//         if(Session_Result.length)
//         {
//             if(validate_email(req_JSON.Buddied_Email) == "Valid Email")
//             {
//                 if(req_JSON.Buddied_Email != Session_Result[0].Email) //not my own email
//                 {
//                     let users = new Datastore("Database/users.db");
//                     users.loadDatabase();
//                     users.find({Email : req_JSON.Buddied_Email},(err,email_matched_array) => {

//                         if(email_matched_array.length) //Email matched someone [someone with this email exists]
//                         {
//                             if(Session_Result[0].Buddies.includes(req_JSON.Buddied_Email)) //The users is already his buddy
//                             {
//                                 let Updated_JSON = JSON.parse(JSON.stringify(Session_Result[0]));
//                                 Updated_JSON.Buddies.splice(Updated_JSON.Buddies.indexOf(req_JSON.Buddied_Email),1);
//                                 users.loadDatabase();
//                                 users.update(Session_Result[0],Updated_JSON,{},(err,NumReplaced) => {
                                    
//                                     console.log("Sucessfully Replaced " + NumReplaced + " Entries hence removed buddy");
                                    
//                                     let his_who_buddied_me_db_dir = "./Media/" + email_matched_array[0].Username + "/Who_Buddied_Me.db";
//                                     let his_who_buddied_me_db = new Datastore(his_who_buddied_me_db_dir);
//                                     his_who_buddied_me_db.loadDatabase();

//                                     his_who_buddied_me_db.remove({Email : Session_Result[0].Email},{},(err,num_removed) => {
                                        
//                                         console.log("His Who_Buddied Me DB removed " + num_removed + " Entries ");
                                        
//                                         let verdict = {
//                                             Status : "Pass",
//                                             Description : "Successfully Un-Buddied"
//                                         }
//                                         res.json(verdict);
//                                     });
//                                 })
//                             }
//                             else //this user is not already his buddy 
//                             {
//                                 let Updated_JSON = JSON.parse(JSON.stringify(Session_Result[0]));
//                                 Updated_JSON.Buddies.push(req_JSON.Buddied_Email);
//                                 users.loadDatabase();

//                                 users.update(Session_Result[0],Updated_JSON,(err,NumReplaced) => {

//                                     console.log("Successfully Replaced " + NumReplaced + " Entries [added Buddy]");
                                    
//                                     let his_who_buddied_me_db_dir = "./Media/" + email_matched_array[0].Username + "/Who_Buddied_Me.db";
//                                     let his_who_buddied_me_db = new Datastore(his_who_buddied_me_db_dir);
//                                     his_who_buddied_me_db.loadDatabase(); 
                                    
//                                     let to_insert_JSON = {
//                                         Email : Session_Result[0].Email , //my email
//                                         Timestamp : Date.now() //buddy added timestamp
//                                     }
//                                     his_who_buddied_me_db.insert(to_insert_JSON,(err,NewDoc) => {

//                                         console.log("Sucessfully Buddied");

//                                         let verdict = {
//                                             Status : "Pass",
//                                             Description : "Successfully Buddied"
//                                         }

//                                         res.json(verdict);
//                                     })
//                                 })
//                             }    
//                         }
//                         else
//                         {
//                             let verdict = {
//                                 Status : "Fail",
//                                 Description : "Person Doesnt Exists"
//                             }
//                             res.json(verdict);
//                         }
//                     })
//                 }
//                 else
//                 {
//                     let verdict = {
//                         Status : "Fail",
//                         Description : "You can't add yourself as your friend"
//                     }
//                     res.json(verdict);
//                 }
//             }
//             else
//             {
//                 let verdict={
//                     Status : "Fail",
//                     Description : "Invalid Buddied Email"
//                 }
//                 res.json(verdict);
//             }
//         }
//         else
//         {
//             let verdict={
//                 Status : "Fail",
//                 Description : "Invalid Session"
//             }
//             res.json(verdict);
//         }

//     })

// }


function Buddy(req_JSON,res)
{
    Validate_Session(req_JSON).then( (Session_Result) => {

        if(Session_Result.length)
        {
            if(Session_Result[0].Buddies.includes(req_JSON.Buddied_Email)) //The users is already my buddy
            {
                let Updated_JSON = JSON.parse(JSON.stringify(Session_Result[0])); //copying the JSON
                Updated_JSON.Buddies.splice(Updated_JSON.Buddies.indexOf(req_JSON.Buddied_Email),1); //removing the buddy
                
                let users = new Datastore("Database/users.db"); //accessing the users db
                users.loadDatabase(); //loading the db

                users.update(Session_Result[0],Updated_JSON,{},(err,NumReplaced) => { //Updating the users db

                    console.log("Sucessfully Replaced " + NumReplaced + " Entries hence removed his email from my buddy list");
                    
                    users.loadDatabase();

                    users.find({Email : req_JSON.Buddied_Email},(err,Email_Matched_Array) => { //finding his username from his email
                        
                        if(Email_Matched_Array.length) //if he exists
                        {
                            let his_who_buddied_me_db_dir = "./Media/" + Email_Matched_Array[0].Username + "/Who_Buddied_Me.db"; //accessing his who buddied me db directory
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
                })
            }
            else
            {
                let Buddy_Requests_DB_Dir = "./Database/Buddy_Requests.db"; //accessing the buddy requests db directory
                let Buddy_Requests_DB = new Datastore(Buddy_Requests_DB_Dir); //accessing the buddy requests db
                Buddy_Requests_DB.loadDatabase(); //loading the buddy requests db
                Buddy_Requests_DB.find({Sender : Session_Result[0].Email , Receiver : req_JSON.Buddied_Email},(err,Pending_Request_Match_Array) => { //finding if buddy request is pending
                 
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
                            Reciever : req_JSON.Buddied_Email,
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
                Description : "Invalid Session"
            }
            res.json(verdict);
        }


    })
}

module.exports = {Buddy}