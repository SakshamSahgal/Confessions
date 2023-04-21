
const { response } = require("express");
const {Validate_Session} = require("../Auth/validate_session.js");
const fs = require("fs")
const Datastore = require("nedb"); //including the nedb node package for database 

function Fetch_Dashboard(req,res)
{
    Validate_Session(req).then( (Session_Result) => {
        
        if(Session_Result.length) //session Exists
        {
            let verdict={
                Status : "Pass",
                Profile_Picture : Session_Result[0].Profile_Picture,
                Email : Session_Result[0].Email,
                Username : Session_Result[0].Username
            }

            FetchPosts(req).then( (fetchPostsResponse) => { //fetching all the viewable posts
                if(fetchPostsResponse.Status == "Pass")
                    verdict.PostsArray = fetchPostsResponse.fetchedPostsArray;
                else
                    verdict.PostsArray = [];
                res.json(verdict);
            })          
        }
        else
        {
            let verdict={
                Status : "Pass",
                Description : "Invalid Session"
            }
            res.json(verdict);
        }
    })
}

async function FetchPosts(req)
{
    let ans = await new Promise((resolve, reject) => {

        Validate_Session(req).then( Session_Result => {
                
                if(Session_Result.length) //If Session Exists
                {
                    let fetchedPostsArray = []; //array that stores all the posts to be fetched
    
                    let usersDB = new Datastore("./Database/users.db");
                    usersDB.loadDatabase();
                    usersDB.find({},(err,usersArray) => { //fetching all users
                        
                        if(usersArray.length == 0) //if no users exist
                        {
                            let verdict = {
                                Status : "Pass",
                                fetchedPostsArray : []
                            }
                            resolve(verdict);
                        }
                        else
                        {
                            let usersCovered = 0;
                            for(var i=0;i<usersArray.length;i++)
                            {
                                let thisusersUsername = usersArray[i].Username;
                                let thisusersProfilePicture = usersArray[i].Profile_Picture;
                                let thisusersPostsDB = new Datastore("./Media/" + thisusersUsername + "/posts.db");
                                thisusersPostsDB.loadDatabase();
                                thisusersPostsDB.find({Visibility : "Global"},(err,globalPostsArray) => { //fetching all Global posts of this user
                                    
                                    let globalPostsArrayCopy = globalPostsArray;
                                    for(var j=0;j<globalPostsArrayCopy.length;j++)
                                    {
                                        globalPostsArrayCopy[j].Username = thisusersUsername;
                                        globalPostsArrayCopy[j].Profile_Picture = thisusersProfilePicture;
                                    }

                                    fetchedPostsArray = fetchedPostsArray.concat(globalPostsArrayCopy); //concatenating the global posts of this user to the fetchedPostsArray
                                    //console.log(fetchedPostsArray)
                                    usersCovered++;
                                    console.log("aaiya 2.5 " + usersCovered)
                                    if(usersCovered == usersArray.length) //if all the Global posts are fetched
                                    {
                                        if(Session_Result[0].Buddies.length == 0) //if the user has no buddies
                                        {
                                            console.log("aaiya3")
                                            let verdict = {
                                                Status : "Pass",
                                                fetchedPostsArray : fetchedPostsArray
                                            }
                                            resolve(verdict);
                                        }
                                        else
                                        {
                                            let buddiesCovered = 0;
                                            for(var buddyIndex = 0;buddyIndex < Session_Result[0].Buddies.length;buddyIndex++)    //iterating over all the buddies of this user
                                            {
                                                let thisBuddyEmail = Session_Result[0].Buddies[buddyIndex];
                                                let usersDB = new Datastore("./Database/users.db");
                                                usersDB.loadDatabase();
                                                usersDB.find({Email : thisBuddyEmail},(err,buddyArray) => { //fetching the buddy's username using his Email from the User's DB
            
                                                    let thisBuddyUsername = buddyArray[0].Username; //getting the buddy's username
                                                    let thisBuddyProfilePicture = buddyArray[0].Profile_Picture; //getting the buddy's profile picture
                                                    
                                                    let thisBuddyPostsDB = new Datastore("./Media/" + thisBuddyUsername + "/posts.db"); //accessing the buddy's posts DB
                                                    thisBuddyPostsDB.loadDatabase();
                                                    thisBuddyPostsDB.find({Visibility : "Buddies-Only"},(err,BuddyOnlyPostsArray) => { //fetching all the `buddy's only` posts
                                                        
                                                        let BuddyOnlyPostsArrayCopy = BuddyOnlyPostsArray; //copying the buddy's only posts array

                                                        for(var k=0;k<BuddyOnlyPostsArrayCopy.length;k++) //adding the buddy's username and profile picture to each post
                                                        {
                                                            BuddyOnlyPostsArrayCopy[k].Username = thisBuddyUsername;
                                                            BuddyOnlyPostsArrayCopy[k].Profile_Picture = thisBuddyProfilePicture;
                                                        }

                                                        fetchedPostsArray = fetchedPostsArray.concat(BuddyOnlyPostsArrayCopy); //concatenating the buddy's only posts to the fetchedPostsArray
                                                        buddiesCovered++;

                                                        if(buddiesCovered == Session_Result[0].Buddies.length) //if all the buddy's only posts are fetched
                                                        {
                                                            let verdict = {
                                                                Status : "Pass",
                                                                fetchedPostsArray : fetchedPostsArray
                                                            }
                                                            resolve(verdict);
                                                        }
            
                                                    })
            
                                                })
                                            }
                                        }
                                    }
        
                                })
                            }
                        }
                    })
                }
                else
                {
                    let verdict={
                        Status : "Fail",
                        Description : "Invalid Session"
                    }
                    resolve(verdict);
                }
        })
    });

    return ans;
}

function Fetch_All_Themes(req,res) {  

     Validate_Session(req).then( Session_Result => { //validating the session

        if(Session_Result.length) //If Session Exists
        {
            
            let headers = { } //object that contains all the info of this theme
            
            let HeaderThemesTextColor = JSON.parse(fs.readFileSync("./Customization_Datasets/Backgrounds.json","ascii")) //reading font color json 
            const headerThemes = fs.readdirSync("./Public/GUI_Resources/Backgrounds"); //reading all the theme names
            
            headerThemes.forEach( themeName => { //iterating over theme names
                
                console.log(themeName);

                let ThisTheme = [] //array that stores all the data of this theme

                const headerBackgrounds = fs.readdirSync("./Public/GUI_Resources/Backgrounds/" + themeName); //accessing all the background inside this theme
                
                headerBackgrounds.forEach( headerBackgroundName => { //iterating over backgrounds in this theme 
                    
                    console.log(headerBackgroundName);

                    let thisHeader = {
                        path : "./GUI_Resources/Backgrounds/" + themeName + "/" + headerBackgroundName,
                        HeaderFontColor : HeaderThemesTextColor[themeName][headerBackgroundName.split(".")[0]].headerFontColor
                    }

                    ThisTheme.push(thisHeader)
                })

                headers[themeName] = ThisTheme
            })


            let verdict = {
                Status : "Pass",
                Description : "Fetched Themes Successfully" ,
                headers : headers,
            }
    
            res.json(verdict);
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

function FetchMoods(req,res)
{
    Validate_Session(req).then( Session_Result => {
       
        if(Session_Result.length)
        {
            let moods = JSON.parse(fs.readFileSync("./Customization_Datasets/Moods.json","ascii"));
            let verdict = {
                Status : "Pass",
                moods : moods
            }
            res.json(verdict);
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

module.exports = {FetchMoods,Fetch_All_Themes,Fetch_Dashboard}