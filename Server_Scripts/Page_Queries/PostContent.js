const { Validate_Session } = require("../Auth/validate_session.js");
const Datastore = require("nedb"); //including the nedb node package for database 


function Post_it(req,res)
{
    console.log(req.body)
    Validate_Session(req).then( (SessionResult) => {

        if(SessionResult.length)
        {
            if(req.body.Visibility == "Anonymous" || req.body.Visibility == "Public")
            {
                if(req.body.Content.length >= 5 && req.body.Content.length <= 280)
                {
                    let json_to_post = {
                        Timestamp : Date.now(),
                        Content : req.body.Content,
                        Visibility : req.body.Visibility
                    }

                    let posts_db_dir = "./Media/" + SessionResult[0].Username + "/Posts.db";
                    const posts_db = new Datastore(posts_db_dir);
                    posts_db.loadDatabase();
                    posts_db.insert(json_to_post);
                    let verdict = {
                        Status : "Pass",
                        Description : "Successfully Posted!"
                    }
                    res.json(verdict);
                }
                else
                {
                    if(req.body.Content.length < 5)
                    {
                        let verdict = {
                            Status : "Fail",
                            Description : "Content Length < 5"
                        }
                        res.json(verdict);
                    }
                    else
                    {
                        let verdict = {
                            Status : "Fail",
                            Description : "Content Length > 280"
                        }
                        res.json(verdict);
                    }
                }
            }
            else
            {
                let verdict = {
                    Status : "Fail",
                    Description : "Visibility Undefined"
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

module.exports = {Post_it};