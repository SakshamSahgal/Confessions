let loadOverlay = document.getElementById("Load_overlay");
let Confessions_Pallet =  document.getElementById("Confessions_Pallet");

let fetchedProfileData; //variable to store the fetched profile data

function Logout()
{
        if(Cookies.get("Session_ID") == undefined)
            location.href = "../index.html";
        else
        {
            loadOverlay.hidden = false;  //Revealing the load overlay

            axios.put('/logout_api',{},{headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID") }}).then(response => {
                
                console.log(response.data);
                loadOverlay.hidden = true; //hiding load overlay
                if(Cookies.get("Session_ID") != undefined)
                    Cookies.remove("Session_ID");
                location.href = "../index.html";
            })
    }
}

function Convert_Timestamp_To_Date(Timestamp) //function that converts timestamp to date
{
    let date = new Date(Timestamp);
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
}


function Fetch_Profile_Page() //funtion fetches the static profile data and displays it on the UI
{   
    if(Cookies.get("Session_ID") == undefined)
        location.href = "../index.html";
    else
    {
        loadOverlay.hidden = false; //revealing the load overlay

        Username = ((window.location.href).split("/")[4]).split(".")[0] //getting the username from the URL

        axios.get('/Profiles/' + Username, {headers: {'Authorization': Cookies.get("Session_ID") }}).then(response => {
            console.log(response.data);
            fetchedProfileData = response.data; //storing the fetched profile data
            loadOverlay.hidden = true; //hiding the load overlay
            
            if(response.data.Status == "Pass")
            {
                displayPostsnPolls(response.data.Posts);
                document.getElementById("Profile_Photo").src = "../" + (response.data.His_Profile_Picture);
                document.getElementById("Username").textContent = response.data.Username;
                document.getElementById("user_bio").textContent = response.data.Bio;
                document.getElementById("User_Gender").textContent = response.data.Gender;
                document.getElementById("User_Email").textContent = response.data.Email;
                document.getElementById("Activity_Status").textContent = response.data.Activity_Status;
                document.getElementById("profile_picture").src = "../" + response.data.My_Profile_Picture;
                
                if(response.data.Activity_Status == "Online")
                    document.getElementById("Activity_Status").style="color: green;";
                else
                    document.getElementById("Activity_Status").style="color: red;";
                                    

                if(response.data.Buddy_Btn_Status == "Remove Buddy")
                {
                    document.getElementById("buddy_btn").classList.value = ""
                    document.getElementById("buddy_btn").classList.add("btn")
                    document.getElementById("buddy_btn").classList.add("btn-danger") 
                    
                    document.getElementById("buddy_icon_display").src = "../GUI_Resources/Remove_Buddy.png";
                    document.getElementById("Buddy_btn_Text").innerHTML = response.data.Buddy_Btn_Status;
                }
                else if(response.data.Buddy_Btn_Status == "Decline Pending Buddy Request")
                {
                    document.getElementById("buddy_btn").classList.value = ""
                    document.getElementById("buddy_btn").classList.add("btn")
                    document.getElementById("buddy_btn").classList.add("btn-warning") 
                    
                    document.getElementById("buddy_icon_display").src = "../GUI_Resources/Pending.png";
                    document.getElementById("Buddy_btn_Text").innerHTML = response.data.Buddy_Btn_Status
                }
                else //"Add Buddy"
                {
                    document.getElementById("buddy_btn").classList.value = ""
                    document.getElementById("buddy_btn").classList.add("btn")
                    document.getElementById("buddy_btn").classList.add("btn-success") 
                    
                    document.getElementById("buddy_icon_display").src = "../GUI_Resources/Add_Buddy.png";
                    document.getElementById("Buddy_btn_Text").innerHTML = response.data.Buddy_Btn_Status
                }
            }
            else
            {
                if(response.data.Description == "You are accessing your Own Profile")
                    location.href = "../Profiles.html";
                else
                    alert(response.data.Description);
            }

        })
    }
}

function displayPostsnPolls(posts)
{
    posts.forEach( thisPost => {
        
        console.log(thisPost)
         if(thisPost.PostType == 'Post')
         {   
            let thisPostHtml =  `
                                <div class="row">
                                    <div class="col my-5">
                                        <div class="card" style="max-width: 80vw; border:5px solid black">
                                            <div class="card-header previewPostCardHeader">
                                                <div class="d-flex align-items-center">
                                                    <span class="badge badge-secondary" style="font-size: 10px;">Visibility : ${thisPost.Visibility}</span><small style="font-size: 10px;position: absolute;right: 30;"> &nbsp;${Convert_Timestamp_To_Date(thisPost.Timestamp)}</small>
                                                </div>   
                                            </div>
                                            <div class="card-header previewPostCardHeader" style="background-image: url(../${thisPost.PostHeader.HeaderThemeBackground})">
                                                    <div>
                                                        <img src="../${thisPost.Profile_Picture}" alt="Profile Picture" class="rounded-circle me-3" width="50">
                                                        <div>
                                                            <a ${ (thisPost.Username == "Anonymous") ? "" : ("href='/Profiles/" + thisPost.Username + "'")  } class="m-0 headerText" style="font-size: 15px;color: ${thisPost.PostHeader.UsernameFontColor};">${(thisPost.Visibility == "Anonymous") ? "Anonymous" : thisPost.Username  }</a>
                                                            <br>
                                                            <small class="headerText" style="font-size: 10px;color: ${thisPost.PostHeader.EmailFontColor};">${thisPost.PostedBy}</small>
                                                        </div>
                                                        <!-- Mood Badge -->
                                                        <div style="position: absolute;right: 8;" ${(thisPost.Mood.MoodBadge == "") ? "hidden" : ""} ><span class="badge badge-secondary" style="font-size: 15px;" title='${thisPost.Mood.MoodTitle}'> ${thisPost.Mood.MoodBadge} </span></div>
                                                    </div>   
                                                    
                                            </div>
                                            <div class="card-body">
                                                <p class="card-text postTextPreviewPlaceHolder">${thisPost.Content}</p>
                                            </div>
                                            <div class="card-footer">
                                                <div class="d-flex justify-content-between align-items-center">
                                                    <div class="row">
                                                        <div class="col">
                                                            <button class="btn btn-sm btn-secondary" onclick=commentPost('${thisPost._id}')  ${(thisPost.Visibility == "Anonymous") ? "disabled" : ""} ><i class="bi bi-chat" style="font-size: 12px;">Comment</i></button>
                                                        </div>
                                                        <div class="col" >
                                                            <div class="dropdown">
                                                                <button class="btn btn-sm btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" ${(thisPost.Visibility == "Anonymous") ? "disabled" : ""}  ><i class="bi bi-emoji-smile" style="font-size: 12px;">React</i></button>
                                                                <div class="dropdown-menu">
                                                                    <a class="dropdown-item" href="#"><button ${(thisPost.Visibility == "Anonymous") ? "disabled" : ""} style="font-size: 20px;" class="reaction-btn" onclick="react('🤬')"> 🤬 Angry </button></a>
                                                                    <a class="dropdown-item" href="#"><button ${(thisPost.Visibility == "Anonymous") ? "disabled" : ""} style="font-size: 20px;" class="reaction-btn" onclick="react('😢')"> 😢 Sad </button></a>
                                                                    <a class="dropdown-item" href="#"><button ${(thisPost.Visibility == "Anonymous") ? "disabled" : ""} style="font-size: 20px;" class="reaction-btn" onclick="react('😍')"> 😍 Love </button></a>
                                                                    <a class="dropdown-item" href="#"><button ${(thisPost.Visibility == "Anonymous") ? "disabled" : ""} style="font-size: 20px;" class="reaction-btn" onclick="react('😆')"> 😆 Laugh </button></a>
                                                                    <a class="dropdown-item" href="#"><button ${(thisPost.Visibility == "Anonymous") ? "disabled" : ""} style="font-size: 20px;" class="reaction-btn" onclick="react('🤩')"> 🤩 Excited </button></a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                    </div>
                                                    <small class="text-muted">&nbsp; ${thisPost.Content.length}/280</small>
                                                </div>
                                            </div>
                                            <div class="card-footer">
                                                <div class="d-flex justify-content-between align-items-center">
                                                        <span class="badge badge-dark"> 
                                                        🤬 : ${thisPost.Reactions.Angry} 
                                                        😢 : ${thisPost.Reactions.Sad} 
                                                        😍 : ${thisPost.Reactions.Love} 
                                                        😆 : ${thisPost.Reactions.Laugh} 
                                                        🤩 : ${thisPost.Reactions.Excited}
                                                        </span> 
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>` 
                                
                document.getElementById("postsTabList").innerHTML += thisPostHtml;
         }
         else
         {

         }
    })
}


function Submit_Confession() //function called when user submits an anonymous confession form
{
    if(Cookies.get("Session_ID") == undefined)
    location.href = "../index.html";
    else
    {
        let Session = {
            Confessed_To_Email : document.getElementById("User_Email").textContent, //getting the username from the URL
            Confession_Data : document.getElementById("confession_data").value,
        }

        console.log("Submitting Confession" , Session);
        loadOverlay.hidden = false;

        axios.post('/Confess_api', Session, {headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID") }}).then(response => {
            console.log(response.data);
            loadOverlay.hidden = true;
            alert(response.data.Description);

        })
    }
}

function Close_Confession_Pallet()
{
    Confessions_Pallet.hidden = true;
}


function View_Confessions()
{
    Confessions_Pallet.hidden = false;
    let Session = {
        
    }

    if(Cookies.get("Session_ID") == undefined) //someone tried accessing through link [he'll be redirected]
        location.href = "../index.html";
    else
    {
        console.log(Session);
        loadOverlay.hidden = false;

        let Username_To_Fetch = document.getElementById("Username").textContent;

        axios.get("/fetch_static_confessions/" + Username_To_Fetch, {headers: {'Authorization': Cookies.get("Session_ID")}}).then(response => {
            
            console.log(response.data);
            display_confessions_got_data(response.data.Confessions_Got_array);
            loadOverlay.hidden = true;
            alert(response.data.Description);

        })

    }
}

function display_confessions_got_data(confessions_got_array) //function displays the ftched confessions data 
{
    let Confessions_Got_List = document.getElementById("Confessions_Got_div");
    Confessions_Got_List.innerHTML = ""; //emptying the prefiously fetched data
    confessions_got_array.forEach((element) => {

        // anchor tag for list element
        let this_a = document.createElement("a"); 
        this_a.href = "#/";
        this_a.classList.add("list-group-item");  //Adding Bootstrap CSS Classes
        this_a.classList.add("list-group-item-action");
        this_a.classList.add("flex-column");
        this_a.classList.add("align-items-start");
        this_a.classList.add("list-group-item-info");

        let this_div = document.createElement("div");
        this_div.classList.add("d-flex");
        this_div.classList.add("w-100");
        this_div.classList.add("justify-content-between");
        
        let this_h5_content_heading = document.createElement("h5");
        this_h5_content_heading.classList.add("mb-1");
        this_h5_content_heading.innerHTML = 'Anonymous Confession';
        
        let this_small_timestamp = document.createElement("small");
        this_small_timestamp.innerHTML = element.Timestamp;

        let this_p_content = document.createElement("p");
        this_p_content.classList.add("mb-1");
        this_p_content.innerHTML = element.Confession;

        this_div.appendChild(this_h5_content_heading);
        this_div.appendChild(this_small_timestamp);
        this_a.appendChild(this_div);
        this_a.appendChild(this_p_content);
        Confessions_Got_List.appendChild(this_a); //appending the list anchor to the list
    })

}

function Buddy()
{
    if(Cookies.get("Session_ID") == undefined)
        location.href = "../index.html";
    else
    {
        loadOverlay.hidden = false;
        
        let Session = {
            Buddied_Email : document.getElementById("User_Email").textContent
        }

        axios.put('/Buddy_api',Session,{headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID") }}).then(response => {

            if(response.data.Status == "Fail" && response.data.Description == "Invalid Session")
                location.href = "./index.html";
            else
            {
                console.log(response.data);
                loadOverlay.hidden = true;
                alert(response.data.Description);
                if(response.data.Status == "Pass" && ( response.data.Description == "Successfully Un-Buddied" || response.data.Description == "Successfully Removed the Pending Buddy Request") )
                {
                    document.getElementById("buddy_btn").classList.value = ""
                    document.getElementById("buddy_btn").classList.add("btn")
                    document.getElementById("buddy_btn").classList.add("btn-success") 
                    
                    document.getElementById("buddy_icon_display").src = "../GUI_Resources/Add_Buddy.png";
                    document.getElementById("Buddy_btn_Text").innerHTML = "Add Buddy"
                }
                else
                {
                    document.getElementById("buddy_btn").classList.value = ""
                    document.getElementById("buddy_btn").classList.add("btn")
                    document.getElementById("buddy_btn").classList.add("btn-warning") 
                    
                    document.getElementById("buddy_icon_display").src = "../GUI_Resources/Pending.png";
                    document.getElementById("Buddy_btn_Text").innerHTML = "Decline Pending Buddy Request";
                }
            }
        })
    }
}

Fetch_Profile_Page();