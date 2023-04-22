const { Validate_Session } = require("../Auth/validate_session.js");
const Datastore = require("nedb"); //including the nedb node package for database 

const fs = require("fs");
//Dotenv
require("dotenv").config();//reading the .env file


function getHeaderBackgroundPath(postHeader)
{
    if(postHeader.headerThemeBackground == '' && postHeader.usernameFontColor == '' && postHeader.emailFontColor == '') //no header selected
    return '';
    
    let bgJSON = JSON.parse(fs.readFileSync("./Customization_Datasets/Backgrounds.json","ascii"));
    //console.log(bgJSON)
    for (let [ThemeName, themeBackgrounds] of Object.entries(bgJSON)) { //iterating over the themes
        if(  themeBackgrounds[postHeader.headerThemeBackground] != undefined && themeBackgrounds[postHeader.headerThemeBackground].headerFontColor == postHeader.emailFontColor &&  themeBackgrounds[postHeader.headerThemeBackground].headerFontColor == postHeader.usernameFontColor)
        return `./GUI_Resources/Backgrounds/${ThemeName}/${postHeader.headerThemeBackground}.jpg`
    }
}

function validateHeader(postHeader){ //function that checks if the header bg and the header font colors are actually valid is actually valid 
    
    if(postHeader.headerThemeBackground == '' && postHeader.usernameFontColor == '' && postHeader.emailFontColor == '') //no header selected
        return true;

    let bgJSON = JSON.parse(fs.readFileSync("./Customization_Datasets/Backgrounds.json","ascii"));
    //console.log(bgJSON)
    for (let [ThemeName, themeBackgrounds] of Object.entries(bgJSON)) { //iterating over the themes
        if(  themeBackgrounds[postHeader.headerThemeBackground] != undefined && themeBackgrounds[postHeader.headerThemeBackground].headerFontColor == postHeader.emailFontColor &&  themeBackgrounds[postHeader.headerThemeBackground].headerFontColor == postHeader.usernameFontColor)
            return true;
    }
    return false;
}

function validateContent(content){ //function that validates the content inputed
    
    if(content.length >= process.env.Min_Content_Length && content.length <= process.env.Max_Content_Length)
    return true;
    else
    return false;
}

function validateMoodBadge(moodBadge){ //function that validates the mood badge for any hazards

    if(moodBadge == '') //no mood badge selected
        return true;

    let moods = JSON.parse(fs.readFileSync("./Customization_Datasets/Moods.json","ascii"))

    for(let [moodTheme , thisThemeArray] of Object.entries(moods)) //iterating over emoji database
    {
        if(thisThemeArray.find(obj => obj.emoji == moodBadge) != undefined) //finding this emoji in DB
            return true;
    }
    return false;
}

function validateVisibility(visibility){
    return ( ["Anonymous","Buddies-Only","Global"].includes(visibility) ); //checking if the visibility is any one of the three
}

function ValidateReaction(reaction)
{
    return(["Angry","Sad","Love","Laugh","Excited"].includes(reaction))
}


function getMoodTitle(moodBadge)
{
    if(moodBadge == '') //no mood badge selected
        return "";

    let moods = JSON.parse(fs.readFileSync("./Customization_Datasets/Moods.json","ascii"))
    
    console.log(moods)

    for(let [moodTheme , thisThemeArray] of Object.entries(moods)) //iterating over emoji database
    {
        if(thisThemeArray.find(obj => obj.emoji == moodBadge) != undefined) //finding this emoji in DB
            return (thisThemeArray.find(obj => obj.emoji == moodBadge)).name //finding this emoji name in DB
    }
}


function Post_it(req,res) { 

    Validate_Session(req).then(SessionResult => {

        if(SessionResult.length)
        {
            console.log(req.body)

            let check = {
                headerValid : (validateHeader(req.body.postHeader)) ,
                ContentValid : validateContent(req.body.content) ,
                moodValid : validateMoodBadge(req.body.moodBadge),
                visibilityValid : validateVisibility(req.body.visibility)
            }

            if(check.headerValid && check.ContentValid && check.moodValid && check.visibilityValid) //Everything is valid
            {

                let userPostDB = new Datastore("./Media/" + SessionResult[0].Username + "/posts.db");
                userPostDB.loadDatabase();
                let postJSON = req.body;

                postJSON = {
                    PostType : "Post",
                    Visibility : req.body.visibility,
                    Content : req.body.content,
                    Mood : {
                        MoodBadge : req.body.moodBadge,
                        MoodTitle : getMoodTitle(req.body.moodBadge)  
                    },
                    PostHeader : {
                        HeaderThemeBackground : getHeaderBackgroundPath(req.body.postHeader),
                        UsernameFontColor : req.body.postHeader.usernameFontColor,
                        EmailFontColor : req.body.postHeader.emailFontColor
                    },
                    PostedBy : (req.body.visibility == "Anonymous") ? "@anonymous" : SessionResult[0].Email,
                    Timestamp : Date.now(),
                    Reactions : {
                        'Angry' : [],
                        'Sad' : [],
                        'Love' : [],
                        'Laugh' : [],
                        'Excited' : []
                    },
                    Comments : []
                }
                
                console.log(postJSON)

                userPostDB.insert(postJSON,(err,newDoc) => {

                    if(err)
                    {
                        console.log(err);

                        let verdict = {
                            Status : "fail",
                            Description : err
                        }
                        res.json(verdict)
                    }
                    else
                    {
                        let verdict = {
                            Status : "Pass",
                            Description : "Successfully Posted",
                            Check : check
                        }
                        res.json(verdict)
                    }
                })

            }
            else
            {
                let verdict = {
                    status : "Fail",
                    Description : "One or more post format is wrong",
                    check : check
                }
                res.json(verdict)
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


function deletePost(req,res)
{

    Validate_Session(req).then(SessionResult => {   
        
        if(SessionResult.length)
        {
            let userPostDB = new Datastore("./Media/" + SessionResult[0].Username + "/posts.db");
            userPostDB.loadDatabase();
            
            console.log(req.params.postId);
            userPostDB.find({_id : req.params.postId}, (err,docs) => {
                if(err)
                {
                    console.log(err);
                    let verdict = {
                        Status : "Fail",
                        Description : err
                    }
                    res.json(verdict);
                }
                else
                {
                    if(docs.length) //that post is yours only
                    {
                        userPostDB.remove({_id : req.params.postId}, {}, (err, numRemoved) => {
                            if(err)
                            {
                                console.log(err);
                                let verdict = {
                                    Status : "Fail",
                                    Description : err
                                }
                                res.json(verdict);
                            }
                            else
                            {
                                console.log(numRemoved);
                                let verdict = {
                                    Status : "Pass",
                                    Description :"Successfully Deleted Post"
                                }
                                res.json(verdict);
                            }
                        });
                    }
                    else
                    {
                        let verdict = {
                            Status : "Fail",
                            Description : "Either You don't have access to delete this post or this post doesn't exist"
                        }
                        res.json(verdict);
                    }
                    
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


// req.body = {
//         postedBy : postedBy,
//         postID : postID,
//         Reaction : reaction
// }

function reactPost(req,res)
{
    Validate_Session(req).then(SessionResult => {
        if(SessionResult.length) //session is valid
        {
            if(ValidateReaction(req.body.Reaction)) //reaction is valid
            {
                let userDB = new Datastore("./Database/users.db");
                userDB.loadDatabase();
                userDB.find({Username : req.body.postedBy},(err,userMatchArray) => {
    
                        if(userMatchArray.length) //that user exists
                        {
                            let postDB = new Datastore("./Media/" + req.body.postedBy + "/posts.db");
                            postDB.loadDatabase();
                            postDB.find({_id : req.body.postID},(err,postmatchArray) => {
    
                                    if(err)
                                    {
                                        let verdict = {
                                            Status : "Fail",
                                            Description : err
                                        }
                                        res.json(verdict);
                                    }
                                    else
                                    {
                                        if(postmatchArray.length) //if that post exists
                                        { 
                                            let myEmail = SessionResult[0].Email;

                                            let reactionsEmailArray = []
                                            
                                            reactionsEmailArray = reactionsEmailArray.concat(postmatchArray[0].Reactions["Angry"])
                                            reactionsEmailArray = reactionsEmailArray.concat(postmatchArray[0].Reactions["Sad"])
                                            reactionsEmailArray = reactionsEmailArray.concat(postmatchArray[0].Reactions["Love"])
                                            reactionsEmailArray = reactionsEmailArray.concat(postmatchArray[0].Reactions["Laugh"])
                                            reactionsEmailArray = reactionsEmailArray.concat(postmatchArray[0].Reactions["Excited"])

                                            let postCopy = JSON.parse(JSON.stringify(postmatchArray[0]))

                                            if(reactionsEmailArray.includes(myEmail)) //i have already reacted this
                                            {
                                                
                                                if(postCopy.Reactions["Angry"].includes(myEmail))
                                                    postCopy.Reactions["Angry"].splice(postCopy.Reactions["Angry"].indexOf(myEmail),1)
                                                if(postCopy.Reactions["Sad"].includes(myEmail))
                                                    postCopy.Reactions["Sad"].splice(postCopy.Reactions["Sad"].indexOf(myEmail),1)
                                                if(postCopy.Reactions["Love"].includes(myEmail))
                                                    postCopy.Reactions["Love"].splice(postCopy.Reactions["Love"].indexOf(myEmail),1)
                                                if(postCopy.Reactions["Laugh"].includes(myEmail))
                                                    postCopy.Reactions["Laugh"].splice(postCopy.Reactions["Laugh"].indexOf(myEmail),1)
                                                if(postCopy.Reactions["Excited"].includes(myEmail))
                                                    postCopy.Reactions["Excited"].splice(postCopy.Reactions["Excited"].indexOf(myEmail),1)
                                                
                                                postCopy.Reactions[req.body.Reaction].push(myEmail)

                                                postDB.loadDatabase();
                                                postDB.update(postmatchArray[0],postCopy,{},(err,numReplaced) => {
                                                        
                                                        if(err)
                                                        {
                                                            let verdict = {
                                                                Status : "Fail",
                                                                Description : err
                                                            }
                                                            res.json(verdict);
                                                        }
                                                        else
                                                        {
                                                            console.log("Successfully replaced " + numReplaced + "While Reacting")
                                                            let verdict = {
                                                                Status : "Pass",
                                                                Description : "Successfully Re-Reacted",
                                                                NewReactions : postCopy.Reactions
                                                            }
                                                            res.json(verdict);
                                                        }
                                                })
                                            }
                                            else
                                            {
                                                postCopy.Reactions[req.body.Reaction].push(myEmail)
                                                postDB.loadDatabase();
                                                postDB.update(postmatchArray[0],postCopy,{},(err,numReplaced) => {
                                                    
                                                    if(err)
                                                    {
                                                        let verdict = {
                                                            Status : "Fail",
                                                            Description : err
                                                        }
                                                        res.json(verdict);
                                                    }
                                                    else
                                                    {
                                                        console.log("Successfully replaced " + numReplaced + "While Reacting")
                                                        let verdict = {
                                                            Status : "Pass",
                                                            Description : "Successfully Reacted",
                                                            NewReactions : postCopy.Reactions
                                                        }
                                                        res.json(verdict);
                                                    }

                                                })
                                            }
                                        }
                                        else
                                        {
                                            let verdict = {
                                                Status : "Fail",
                                                Description : "The post doesn't Exists"
                                            }
                                            res.json(verdict);
                                        }
                                    }
    
                            })
                        }
                        else
                        {
                            let verdict = {
                                Status : "Fail",
                                Description : "The User who Posted Doesn't Exists"
                            }
                            res.json(verdict);
                        }
                })
            }
            else
            {

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





module.exports = {Post_it,deletePost,reactPost};