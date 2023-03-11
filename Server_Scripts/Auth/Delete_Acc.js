//NEDB
const Datastore = require("nedb"); //including the nedb node package for database 
const users = new Datastore("Database/users.db");
//-------------------------------------------------------------------------------------
const {Validate_Session} = require("../Auth/validate_session.JS")
const {Delete_Directory} = require("../directories.js"); //for creating Directories

function Delete_Account(req_JSON,res)
{
        console.log("searching for session -> ");
        console.log(req_JSON.Session_ID);
        
        Validate_Session(req_JSON).then((session_matched_array) => {
            if(session_matched_array.length) //valid Session
            {
                Erase_Confessions_Sent(session_matched_array).then((returned_json_from_erase_confessions_sent) => {
                    
                    console.log(returned_json_from_erase_confessions_sent)

                    Erase_Confessions_Got(session_matched_array).then((returned_json_from_erase_confessions_got) => {
                        
                        console.log(returned_json_from_erase_confessions_got);

                        users.loadDatabase();
                        users.remove(session_matched_array[0],{},(err,NumRemoved) => {
                            
                            console.log("No of entries removed from DB = " + NumRemoved);
                            let dir = "Media/" + session_matched_array[0].Username;
                            console.log(Delete_Directory(dir)); //deleting the media folder
                            dir = "Public/Profiles/" + session_matched_array[0].Username + ".html";
                            console.log(Delete_Directory(dir)); //deleting the profile page
                            let verdict={
                                Status : "Pass",
                                Description : "Successfully Deleted Account"
                            }
                            res.json(verdict);
                        })
                    })
                })                
            }
            else //invalid Session
            {
                let verdict={
                    Status : "Fail",
                    Description : "Invalid Session"
                }
                res.json(verdict);
            }
        })
}

async function Erase_Confessions_Sent(session_matched_array) //function that erases all the confessions sent to other users in their DB
{
    let ans = await new Promise((resolve, reject) => {
                
        let confessions_sent_dir = "Media/" + session_matched_array[0].Username + "/Confessions_Sent.db"; //accessing the DB dir of confessions sent

        let my_confessions_sent_db = new Datastore(confessions_sent_dir); //fetching the confessions sent db of this user
        my_confessions_sent_db.loadDatabase(); //loading the confessions sent db of this user
        my_confessions_sent_db.find({},(err,confessions_sent_array) => {  //fetching all the entries

            if(confessions_sent_array.length) //if this user has sent any confessions
            {
                let users_covered = 0; //to count the number of users covered so far

                confessions_sent_array.forEach(element => { //iterating over each entry in the confessions sent DB of this user
                
                    console.log(element);
                    
                    users.loadDatabase(); //loading the users DB
                    users.find({Email : element.Confessed_To},(err,username_matched_array) => { //fetching the username of that user from the email

                        if(username_matched_array.length)
                        {
                            let that_users_confessions_got_db_dir = "Media/" + username_matched_array[0].Username + "/Confessions_Got.db"; //accessing that user's Confessions got DB dir
                            let that_users_confessions_got_db = new Datastore(that_users_confessions_got_db_dir); //fetching that user's Confessions got DB dir
                            that_users_confessions_got_db.loadDatabase(); //loading that user's Confessions got DB dir
                            that_users_confessions_got_db.remove({Confessed_by : session_matched_array[0].Email},{multi : true},(err,NumRemoved) => { //deleting all my confessions

                                console.log("removed " + NumRemoved + " Entries while clearing confessions sent");
                                users_covered++;

                                if(users_covered == confessions_sent_array.length) //if all users are covered
                                {
                                    let verdict={
                                        Status : "Pass",
                                        Description : "Successfully Erased Confessions Sent"
                                    }
                                    resolve(verdict);
                                }
                            })
                        }
                        else
                        {
                            let verdict={
                                Status : "Fail",
                                Description : "Username corresponding to " + element.Confessed_To +" not found"
                            }
                            reject(verdict)
                        }
                    })
                })
            }
            else
            {
                let verdict={
                    Status : "Pass",
                    Description : "Successfully Erased Confessions Sent"
                }
                resolve(verdict);
            }
        })
    })
    return ans;    
}

async function Erase_Confessions_Got(session_matched_array) 
{
    let ans = await new Promise((resolve, reject) => {
            
                let users_covered = 0;

                let confessions_got_dir = "Media/" + session_matched_array[0].Username + "/Confessions_Got.db"; //accessing my DB dir of confessions got
                let confessions_got_db = new Datastore(confessions_got_dir); //fetching the confessions got db of this user
                confessions_got_db.loadDatabase(); //loading the confessions got db of this user
                confessions_got_db.find({},(err,confessions_got_array) => {  //fetching all the entries in confessions got db of this user
                    
                    if(confessions_got_array.length) //if he/she has got any confessions
                    {
                        confessions_got_array.forEach((element) => { //iterating over each confession
                            users.loadDatabase();
                            users.find({Email : element.Confessed_by},(err,username_matched_array) => { //fetching the username of that user from the email

                                if(username_matched_array.length)
                                {   
                                    let that_user_confession_sent_dir = "Media/" + username_matched_array[0].Username + "/Confessions_Sent.db"; //accessing that user's confessions sent DB dir
                                    let that_user_confession_sent_DB = new Datastore(that_user_confession_sent_dir);
                                    that_user_confession_sent_DB.loadDatabase();
                                    that_user_confession_sent_DB.remove({Confessed_To : session_matched_array[0].Email} , {multi : true} , (err,NumRemoved) => {

                                        console.log("removed " + NumRemoved + " Entries while clearing confessions got");
                                        users_covered++;

                                        if(users_covered == confessions_got_array.length)
                                        {
                                            let verdict={
                                                Status : "Pass",
                                                Description : "Successfully Erased Confessions Got"
                                            }
                                            resolve(verdict);
                                        }
                                    })
                                }
                                else
                                {
                                    let verdict={
                                        Status : "Fail",
                                        Description : "Username corresponding to " + element.Confessed_by +" not found"
                                    }
                                    reject(verdict)
                                }
                            })

                        })
                       
                    }
                    else
                    {
                        let verdict={
                            Status : "Pass",
                            Description : "Successfully Erased Confessions Got"
                        }
                        resolve(verdict);
                    }

                })
        })
		
    return ans;    
}

module.exports = {Delete_Account}