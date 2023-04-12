//NEDB
const Datastore = require("nedb"); //including the nedb node package for database 
const users = new Datastore("Database/users.db");


async function Validate_Session(req) //function validates session and updates last activity if it exists
{
    console.log("searching for session in validate session -> ");
    console.log(req.headers.authorization);
    
    let Session_Judgement = await new Promise((resolve, reject) => {
        
        let ID = String(req.headers.authorization); //converting it to string
        
        users.loadDatabase(); //loading the users database
        users.find({"Session.Session_ID" : ID},(err,session_match_array) => { //checking if the user is currently logged in [Session Exists]
            if (err) reject(err);
            
            console.log("found logged in data in validate session = ");
            console.log(session_match_array);
            
            if(session_match_array.length) //if the session Exists
            {
                let Update_JSON = JSON.parse(JSON.stringify(session_match_array[0])); //copying the matched array
                Update_JSON.Last_Activity = Date.now(); //overriding last activity
                users.loadDatabase();
                users.update(session_match_array[0],Update_JSON,{},(err,NumReplaced) => { //updating in DB
                    console.log("Updated last activity of " + NumReplaced + " Entries");
                    let Judgement = [Update_JSON]; //returning updated JSON array
                    resolve(Judgement); 
                })
            }
            else
            {
                let Judgement = session_match_array; //returning the empty array
                resolve(Judgement);
            }
        })
    });
    
    return Session_Judgement;    
}



module.exports = {Validate_Session}