//NEDB
const Datastore = require("nedb"); //including the nedb node package for database 
const users = new Datastore("Database/users.db");
//-------------------------------------------------------------------------------------
const {Validate_Session} = require("./validate_session.js")
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

                        Erase_Buddy_List(session_matched_array).then( (returned_json_from_erase_buddy_List) => {

                            console.log(returned_json_from_erase_buddy_List);

                            Erase_Pending_Requests(session_matched_array).then( (returned_json_from_erase_pending_requests) => {

                                console.log(returned_json_from_erase_pending_requests);

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

async function Erase_Buddy_List(session_matched_array)
{
    let ans = await new Promise((resolve, reject) => {

        if(session_matched_array[0].Buddies.length) //if he has any Buddies
        {
            let buddies_covered = 0;
            session_matched_array[0].Buddies.forEach( buddy_email => { //iterating over my buddy email list 
            
                console.log(buddy_email);
    
                users.loadDatabase();
                users.find({Email : buddy_email} , (err,buddy_matched) => { //Querring his Email on the user's DB to get his username
    
                    if(buddy_matched.length) //found my Buddy's username
                    {
                        let his_who_buddied_me_db_dir = "./Media/" + buddy_matched[0].Username + "/Who_Buddied_Me.db"; //locating his Who_Buddied_Me_DB
                        let his_who_buddied_me_db = new Datastore(his_who_buddied_me_db_dir);  //locating his Who Buddied Me DB
                        his_who_buddied_me_db.loadDatabase();  //loading his Who Buddied Me DB
    
                        his_who_buddied_me_db.remove({Email : session_matched_array[0].Email},{},(err,NumRemoved) => { //removng my Email from his Who_Buddied_Me_Email
                            
                            console.log("Removed " + NumRemoved + " Entries while Deleting entry of " + buddy_matched[0].Username  + "'s who_buddied_me DB");
                            buddies_covered++;
                           if(buddies_covered == session_matched_array[0].Buddies.length)
                           {
                                let verdict = {
                                    Status : "Pass",
                                    Description : "Successfully Cleared Buddy List"
                                }
                                resolve(verdict);
                           }
                        })
                    }
                    else
                    {
                        let verdict={
                            Status : "Fail",
                            Description : "Username corresponding to " + buddy_email + " not found"
                        }
                        reject(verdict)
                    }
    
                })
    
            })
        }
        else
        {
            let verdict = {
                Status : "Pass",
                Description : "Successfully Cleared Buddy List"
            }
            resolve(verdict);
        }
    })

    return ans;    
}


async  function Erase_Pending_Requests(session_matched_array)
{
    let ans = await new Promise((resolve, reject) => {
        
        let Buddy_Request_Dir = "./Database/Buddy_Requests.db"; //accessing the Buddy_Request DB Dir
        let Buddy_Request_DB = new Datastore(Buddy_Request_Dir); //fetching the Buddy_Request DB
        Buddy_Request_DB.loadDatabase(); //loading the Buddy_Request DB

        Buddy_Request_DB.remove({Sender : session_matched_array[0].Email},{multi : true},(err,NumRemoved) => { 
            
            console.log("Removed " + NumRemoved + " pending requests with him as sender");   
            
            Buddy_Request_DB.loadDatabase();

            Buddy_Request_DB.remove({Receiver : session_matched_array[0].Email},{multi : true},(err,NumRemoved) => {
                
                console.log("Removed " + NumRemoved + "  pending requests with him as receiver");
                
                let verdict = {
                    Status : "Pass",
                    Description : "Successfully Cleared Pending Requests"
                }
                
                resolve(verdict);
            })

        });

    });
    return ans;
}

module.exports = {Delete_Account}