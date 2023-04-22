
const { response } = require("express");
const {Validate_Session} = require("../Auth/validate_session.js");
const fs = require("fs")
const Datastore = require("nedb"); //including the nedb node package for database 
const {modifyComments} = require("./PostContent.js");

function Fetch_Dashboard(req,res) //function fetches dashboard data
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

            FetchPosts(Session_Result[0].Buddies).then( (fetchedArray) => { //fetching all the viewable posts
                verdict.PostsArray = fetchedArray;
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


async function getAllGlobalPosts()
{
    let ans = await new Promise((resolve, reject) => {
        let globalPosts = []; //array that stores all global posts
        let usersDB = new Datastore("./Database/users.db");
        usersDB.loadDatabase();
        usersDB.find({},(err,usersArray) => { //fetching all users
            if(usersArray.length == 0) //if no users exist
                resolve([])
            else
            {
                let usersCovered = 0;
                for(var i=0;i<usersArray.length;i++)
                {
                    let thisusersUsername = usersArray[i].Username;                 //username of this user
                    let thisusersProfilePicture = usersArray[i].Profile_Picture;    //profile picture of this user

                    let thisusersPostsDB = new Datastore("./Media/" + thisusersUsername + "/posts.db");
                    thisusersPostsDB.loadDatabase();

                    thisusersPostsDB.find({Visibility : "Global"},(err,globalPostsArray) => { //fetching all Global posts of this user
                        
                        let globalPostsArrayCopy = JSON.parse(JSON.stringify(globalPostsArray));

                        for(var j=0;j<globalPostsArrayCopy.length;j++)
                        {
                            globalPostsArrayCopy[j].Username = thisusersUsername; //adding username to each post of this user
                            globalPostsArrayCopy[j].Profile_Picture = thisusersProfilePicture; //adding profile picture to each post of this user
                        }

                        globalPosts = globalPosts.concat(globalPostsArrayCopy);

                        usersCovered++;

                        if(usersCovered == usersArray.length)
                            resolve(globalPosts);
                    })
                }
            }
                
        })
    })
    return ans;
}

async function getAllAnonymousPosts()
{
    let ans = await new Promise((resolve, reject) => {
        let AnonymousPosts = []; //array that stores all Anonymous posts
        let usersDB = new Datastore("./Database/users.db");
        usersDB.loadDatabase();
        usersDB.find({},(err,usersArray) => { //fetching all users
            if(usersArray.length == 0) //if no users exist
                resolve([])
            else
            {
                let usersCovered = 0;
                for(var i=0;i<usersArray.length;i++)
                {
                    let thisusersUsername = usersArray[i].Username;                 //username of this user

                    let thisusersPostsDB = new Datastore("./Media/" + thisusersUsername + "/posts.db");
                    thisusersPostsDB.loadDatabase();

                    thisusersPostsDB.find({Visibility : "Anonymous"},(err,AnonymousPostsArray) => { //fetching all Global posts of this user
                        
                        let AnonymousPostsArrayCopy = JSON.parse(JSON.stringify(AnonymousPostsArray));

                        for(var j=0;j<AnonymousPostsArrayCopy.length;j++)
                        {
                            AnonymousPostsArrayCopy[j].PostedBy = "@anonymous"; //removing the postedBy(email) from each anonymous post of this user
                            AnonymousPostsArrayCopy[j].Username = "Anonymous"; //removing the username from each anonymous post of this user
                            AnonymousPostsArrayCopy[j].Profile_Picture = "./GUI_Resources/anonymous2.jpg"; //removing the profile picture from each anonymous post of this user
                        }

                        AnonymousPosts = AnonymousPosts.concat(AnonymousPostsArrayCopy);

                        usersCovered++;
                        
                        if(usersCovered == usersArray.length)
                            resolve(AnonymousPosts);
                    })
                }
            }   
        })
    })
    return ans;
}


async function getAllBuddyOnlyPosts(buddiesArray)
{   
    let ans = await new Promise((resolve, reject) => {
        let BuddyOnlyPosts = []; //array that stores all Buddy-Only posts
        
        if(buddiesArray.length == 0) //if no buddies exist
            resolve([])
        else
        {
            let buddiesCovered = 0;
            for(var buddyIndex = 0;buddyIndex < buddiesArray.length;buddyIndex++)    //iterating over all the buddies of this user
            {
                let thisBuddyEmail = buddiesArray[buddyIndex];
                let usersDB = new Datastore("./Database/users.db");
                usersDB.loadDatabase();
                usersDB.find({Email : thisBuddyEmail},(err,buddyArray) => { //fetching the buddy's username using his Email from the User's DB
    
                    let thisBuddyUsername = buddyArray[0].Username; //getting the buddy's username
                    let thisBuddyProfilePicture = buddyArray[0].Profile_Picture; //getting the buddy's profile picture
                    
                    let thisBuddyPostsDB = new Datastore("./Media/" + thisBuddyUsername + "/posts.db"); //accessing the buddy's posts DB
                    thisBuddyPostsDB.loadDatabase();
                    thisBuddyPostsDB.find({Visibility : "Buddies-Only"},(err,BuddyOnlyPostsArray) => { //fetching all the `buddy's only` posts
                        
                        let BuddyOnlyPostsArrayCopy = JSON.parse(JSON.stringify(BuddyOnlyPostsArray)); //copying the buddy's only posts array
    
                        for(var j=0;j<BuddyOnlyPostsArrayCopy.length;j++) //adding the buddy's username and profile picture to each post
                        {
                            BuddyOnlyPostsArrayCopy[j].Username = thisBuddyUsername;
                            BuddyOnlyPostsArrayCopy[j].Profile_Picture = thisBuddyProfilePicture;
                        }
    
                        BuddyOnlyPosts = BuddyOnlyPosts.concat(BuddyOnlyPostsArrayCopy); //concatenating the buddy's only posts to the fetchedPostsArray
                        buddiesCovered++;
    
                        if(buddiesCovered == buddiesArray.length) //if all the buddy's only posts are fetched
                           resolve(BuddyOnlyPosts)
                    })
    
                })
            }
        }
    })
    return ans;
}


async function FetchPosts(buddiesArray) //function that fetches posts to be displayed on dashboard
{
    let ans = await new Promise((resolve, reject) => {

        let postArray = []
        getAllGlobalPosts().then(globalPostsArray => {
            console.log(globalPostsArray)
            PostsArray = postArray.concat(globalPostsArray);
            getAllAnonymousPosts().then(anonymousPostsArray => {
                console.log(anonymousPostsArray)
                PostsArray = PostsArray.concat(anonymousPostsArray);
                getAllBuddyOnlyPosts(buddiesArray).then(buddyOnlyPostsArray => {
                    console.log(buddyOnlyPostsArray)
                    PostsArray = PostsArray.concat(buddyOnlyPostsArray);
                    for(var i=0;i<PostsArray.length;i++)
                        delete PostsArray[i].Comments; //removing the comments from each post so that it can be fetched when needed
                    resolve(PostsArray);
                })
            })
        })
    })

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