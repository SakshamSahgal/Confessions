let loadOverlay = document.getElementById("Load_overlay");
let Profile_Picture_Pallet =  document.getElementById("profile_picture_pallet");
let Buddy_Requests_Pallet = document.getElementById("Buddy_Requests_Pallet");
let fetchedProfileData; //data fetched stored globally

function Logout()
{
    if(Cookies.get("Session_ID") == undefined)
        location.href = "./index.html";
    else
    {    
        loadOverlay.hidden = false;  //Revealing the load overlay
        
        axios.put('/logout_api',{},{headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID") }}).then(response => {
            
            console.log(response.data);
            loadOverlay.hidden = true; //hiding load overlay

            if(Cookies.get("Session_ID") != undefined)
                Cookies.remove("Session_ID");
            location.href = "./index.html";
        })
    }
}

//write a function that converts timestamp to date
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

function Delete_Account() //function called when user clicks on delete account
{
    if(Cookies.get("Session_ID")== undefined)
        location.href = "./index.html";
    else
    {
        loadOverlay.hidden = false;

        axios.delete('/Delete_Account',{headers: {'Authorization': Cookies.get("Session_ID")}}).then(response => {
            
            console.log(response.data);
            loadOverlay.hidden = true;
        
            Cookies.remove("Session_ID");
            if(response.data.Status == "Fail")
                location.href = "./logged_out.html";
            else
                location.href = "./index.html"; //successfully deleted account

        })
    }
}

function Close_Buddy_Request_Pallet()
{
    Buddy_Requests_Pallet.hidden = true;
}


function Get_Profile_Data() //function called at the loading of page [fetches the profile page data]
{
    if(Cookies.get("Session_ID") == undefined)
        location.href = "./index.html";
    else
    {
        loadOverlay.hidden = false;

        axios.get('/Profile_Page_api', {headers: {'Authorization': Cookies.get("Session_ID")}}).then(response => {
            
            console.log(response.data); 
            fetchedProfileData = response.data;
            
            loadOverlay.hidden = true;

            if(response.data.Status != "Pass")
                location.href = "./logged_out.html";
            else
            {
                document.getElementById("Profile_Photo").src = response.data.Profile_Picture;
                document.getElementById("user_bio").textContent = response.data.Bio;
                document.getElementById("User_Gender").textContent = response.data.Gender;
                document.getElementById("Username").textContent = response.data.Username;
                document.getElementById("profile_picture").src = response.data.Profile_Picture; //top right photo
                initialize_edit_data(response.data.Username,response.data.Bio,response.data.Gender);
                displayPostsnPolls(response.data.Posts)
            }
        })
    }
}



function displayPostsnPolls(posts)
{
    var idConter=0;
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
                                                <div class="dropdown" style="position: absolute;right: 8;">
                                                        <button class="btn btn-sm btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
                                                        <div class="dropdown-menu">
                                                            <a class="dropdown-item" href="#" onclick="deletePost('${thisPost._id}')"> Delete </a>
                                                        </div>
                                                </div>
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
                                                        <button class="btn btn-sm btn-secondary" onclick="viewComments('${thisPost._id}','${thisPost.Username}')"  ${(thisPost.Visibility == "Anonymous") ? "disabled" : ""} ><i class="bi bi-chat" style="font-size: 12px;">Comment</i></button>
                                                    </div>
                                                    <div class="col" >
                                                        <div class="dropdown">
                                                            <button class="btn btn-sm btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" ${(thisPost.Visibility == "Anonymous") ? "disabled" : ""}  ><i class="bi bi-emoji-smile" style="font-size: 12px;">React</i></button>
                                                            <div class="dropdown-menu">
                                                                <a class="dropdown-item"><button ${(thisPost.Visibility == "Anonymous") ? "disabled" : ""} style="font-size: 20px;" class="reaction-btn" onclick="react('Angry','${thisPost._id}','${thisPost.Username}')"> 🤬 Angry </button></a>
                                                                <a class="dropdown-item"><button ${(thisPost.Visibility == "Anonymous") ? "disabled" : ""} style="font-size: 20px;" class="reaction-btn" onclick="react('Sad','${thisPost._id}','${thisPost.Username}')"> 😢 Sad </button></a>
                                                                <a class="dropdown-item"><button ${(thisPost.Visibility == "Anonymous") ? "disabled" : ""} style="font-size: 20px;" class="reaction-btn" onclick="react('Love','${thisPost._id}','${thisPost.Username}')"> 😍 Love </button></a>
                                                                <a class="dropdown-item"><button ${(thisPost.Visibility == "Anonymous") ? "disabled" : ""} style="font-size: 20px;" class="reaction-btn" onclick="react('Laugh','${thisPost._id}','${thisPost.Username}')"> 😆 Laugh </button></a>
                                                                <a class="dropdown-item"><button ${(thisPost.Visibility == "Anonymous") ? "disabled" : ""} style="font-size: 20px;" class="reaction-btn" onclick="react('Excited','${thisPost._id}','${thisPost.Username}')"> 🤩 Excited </button></a>
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
                                                🤬 : <span id='${thisPost._id}_Angry'> ${thisPost.Reactions.Angry.length} </span> 
                                                😢 : <span id='${thisPost._id}_Sad'> ${thisPost.Reactions.Sad.length} </span> 
                                                😍 : <span id='${thisPost._id}_Love'> ${thisPost.Reactions.Love.length} </span> 
                                                😆 : <span id='${thisPost._id}_Laugh'> ${thisPost.Reactions.Laugh.length} </span> 
                                                🤩 : <span id='${thisPost._id}_Excited'> ${thisPost.Reactions.Excited.length} </span> 
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



function deletePost(postId)
{
    // alert(postId)
    if(Cookies.get("Session_ID") == undefined)
        location.href = "./index.html";
    else
    {
        axios.delete('/deletePost/' + postId, {headers: {'Authorization': Cookies.get("Session_ID")}}).then(response => {
            console.log(response.data);
            if(response.data.Status  == "Fail" && response.data.Description == "Invalid Session") //tried to delete a post without a valid session
                location.href = "./index.html";
            else
                location.reload();
        })
    }
}

function commentPost(postId){
    alert(postId)
}

function Change_Profile_Picture() //function called when change profile picture is clicked [function displays the list of available profile pictures]
{
   
    if(Cookies.get("Session_ID") == undefined)
        location.href = "./index.html";
    else
    {
        Profile_Picture_Pallet.hidden = false;
        loadOverlay.hidden = false; //revealing the loadOverlay

        axios.get('/fetch_Profile_Pictures_api', {headers: {'Authorization': Cookies.get("Session_ID")}}).then(response => {
            
            console.log(response.data);
            loadOverlay.hidden = true; //Hiding the loadOverlay

            if(response.data.Status != "Pass")
                location.href = "./logged_out.html";
            else
            {
                let in_this_row = 0; //variable to count no of images in a row
                let Inner_Profile_Pallet = document.getElementById("inner_pallet");
                Inner_Profile_Pallet.innerHTML = "";  //clearing earlier childrens if the pallet was opened earlier
                let this_container = document.createElement("div"); //creating container div
                this_container.classList.add("container"); 
                this_container.classList.add("py-5");

                let this_row = document.createElement("div");
                this_row.classList.add("row");
                this_row.classList.add("g-3");

                for(var i=0;i<response.data.Paths.length;i++)
                {
                    let this_col = document.createElement("div"); //creating a col div
                    this_col.classList.add("col-md-4"); //Adding Bootstrap CSS
                    this_col.classList.add("rounded"); //Adding Bootstrap CSS
                    this_col.classList.add("p-3"); //Adding Bootstrap CSS

                    let img_holder_div = document.createElement("div");
                    img_holder_div.classList.add("p-3"); //padding 3 to the image holder div
                    img_holder_div.classList.add("border");
                    img_holder_div.classList.add("rounded");

                    if(response.data.Paths[i] == response.data.Current_Profile_Picture) //changing the background color for the already selected profile picture
                        img_holder_div.style.backgroundColor = "rgba(122, 255, 168, 0.237)";
                    else
                        img_holder_div.style.backgroundColor = "rgba(255, 255, 255, 0.237)";

                    img_holder_div.align = "center";

                    let this_img = document.createElement("img");
                    this_img.src = response.data.Paths[i];



                    this_img.style.maxWidth = "100%";
                    this_img.style.maxHeight = "100%";

                    this_img.addEventListener("click",Select_Profile_Picture.bind(null,response.data.Paths[i])); //Adding click event listener to image
                    
                    img_holder_div.appendChild(this_img);
                    this_col.appendChild(img_holder_div);
                    this_row.appendChild(this_col);
                    
                    this_container.appendChild(this_row);
                    in_this_row++;
                    if(in_this_row == 3)
                    {
                        in_this_row = 0;
                        this_row = document.createElement("div");
                        this_row.classList.add("row");
                        this_row.classList.add("g-3");
                    }
                }
                Inner_Profile_Pallet.appendChild(this_container);
            }
        })
    }
}

function Close_Profile_Pallet() //called when close button is pressed
{
    Profile_Picture_Pallet.hidden = true;
}

function Close_Confessions_Pallet() //called when close confessions pallet button is clicked
{
    document.getElementById("Confessions_Pallet").hidden = true;
}

function Select_Profile_Picture(profile_picture_path) //function called when user selects a profile picture (clicks on it)
{
    console.log(profile_picture_path);
    
    if(Cookies.get("Session_ID") == undefined) //trying to access via link
        location.href =  "./index.html";
    else
    {
        Update = {
            Profile_Picture : profile_picture_path
        }

        axios.put('/update_profile_picture_api',Update,{headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID")}}).then(response => {
            
            console.log(response.data);
            if(response.data.Status == "Fail" && response.data.Description == "Invalid Session")
                location.href = "./logged_out.html";
            else
            {
                document.getElementById("Profile_Photo").src = Update.Profile_Picture;
                document.getElementById("profile_picture").src = Update.Profile_Picture;
                Close_Profile_Pallet();
                alert(response.data.Description);
            }

        })
    }
}

function Remove_Profile_Picture() //function called when user clicks on remove profile picture
{
    if(Cookies.get("Session_ID") == undefined) 
        location.href = "./index.html";
    else
    {
        axios.put('/Remove_Profile_Picture_api',{},{headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID")}}).then(response => {
            console.log(response.data);
            if(response.data.Status == "Pass")
            {
                document.getElementById("Profile_Photo").src = "./GUI_Resources/No_photo.gif";
                document.getElementById("profile_picture").src = "./GUI_Resources/No_photo.gif";
            }
    
            alert(response.data.Description);
        })
    }
}

function Update_Bio()
{
    if(Cookies.get("Session_ID") == undefined)
        location.href = "./index.html";
    else
    {
        let Session = {
            Bio : document.getElementById("Edit_Bio").value
        }

        axios.put('/Update_Bio_api',Session,{headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID")}}).then(response => {
            
            console.log(response.data);

            if(response.data.Status == "Fail" && response.data.Description == "Invalid Session")
                location.href = "./index.html";
            else
            {
                alert(response.data.Description);
                window.location.reload();//refresh page
            }
        })
    }
}

function initialize_edit_data(username,bio,gender) //function that sets the initial value of edit data
{
    document.getElementById("Edit_Username").value = username;
    document.getElementById("Edit_Bio").value = bio;
    if(gender == "male")
        document.getElementById("Edit_Male").checked = true;
    else if(gender == "female")
        document.getElementById("Edit_Female").checked = true;
    else
        document.getElementById("Edit_Not_Specified").checked = true;
}

function Update_Username()
{
    if(Cookies.get("Session_ID") == undefined)
    location.href = "./index.html";
    else
    {
        let Session = {
            Username : document.getElementById("Edit_Username").value
        }
        loadOverlay.hidden = false;
        axios.put('/Update_Username_api',Session,{headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID") }}).then(response => {  
            console.log(response.data);
            loadOverlay.hidden = true;
            alert(response.data.Description);
            window.location.reload();
        })
    }
}


function Get_Gender() //this function returns the selected gender[synchronous function]
{
    let register_gender = document.getElementsByName("Edit_gender"); //getting refrence to the group of gender radio button
    let val;
    register_gender.forEach((x)=>{ //Iterating over each radio button to get which is checked 
        if(x.checked == true)
        val =  x.value;
    })
    return val;
}

function Update_Gender()
{
    
    
    if(Cookies.get("Session_ID") == undefined) //tried logging through link
        location.href = "./index.html";
    else
    {
        let Session = {
            Gender : Get_Gender()
        }
        loadOverlay.hidden = false;

        axios.put('/Update_Gender_api',Session,{headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID")}}).then(response => {
            console.log(response.data);
            loadOverlay.hidden = true;
            alert(response.data.Description);
            window.location.reload();
        })
    }
}


function Update_Password()
{
    if(Cookies.get("Session_ID") == undefined) //tried logging through link
    location.href = "./index.html";
    else
    {
        loadOverlay.hidden = false;
        let Session = {
            Current_Password : document.getElementById("Cur_Password").value , 
            New_Password : document.getElementById("New_Password").value
        }

        axios.put('/Update_Password_api',Session,{headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID")}}).then(response => {
            
            loadOverlay.hidden = true;
            console.log(response.data);
            if(response.data.Status == "Fail" && response.data.Description == "Invalid Session")
                location.href = "./logged_out.html";
            else
                alert(response.data.Description);
        })
    }
}

function View_Confessions()
{
    if(Cookies.get("Session_ID") == undefined) //tried accessing through link
        location.href = "./index.html";
    else
    {
        loadOverlay.hidden = false;

        axios.get('/fetch_confessions', {headers: {'Authorization': Cookies.get("Session_ID")}}).then(response => {
            console.log(response.data);
            loadOverlay.hidden = true;
            if(response.data.Status == "Fail" && response.data.Description == "Invalid Session")
                location.href = "./index.html";
            else
            {
                if(response.data.Status == "Fail")
                    alert(response.data.Description);
                else
                {
                    document.getElementById("Confessions_Pallet").hidden = false;
                    Display_Confessions(response.data.Confessions_Got,response.data.Confessions_Sent);
                }
            }
        })
    }
}

function Display_Confessions(confessions_got_array,confessions_sent_array)
{
    let Confessions_Got_List = document.getElementById("Confessions_i_got_list");
    Confessions_Got_List.innerHTML = ""; //clearing the previously fetched data

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
        this_h5_content_heading.innerHTML = "Anonymous Confession";
        
        let this_small_timestamp = document.createElement("small");
        this_small_timestamp.innerHTML = Convert_Timestamp_To_Date(element.Timestamp);

        let this_p_content = document.createElement("p");
        this_p_content.classList.add("mb-1");
        this_p_content.innerHTML = element.Confession;

        this_div.appendChild(this_h5_content_heading);
        this_div.appendChild(this_small_timestamp);
        this_a.appendChild(this_div);
        this_a.appendChild(this_p_content);
        Confessions_Got_List.appendChild(this_a); //appending the list anchor to the list
    })

    let Confessions_Sent_List = document.getElementById("Confessions_i_sent_list");
    Confessions_Sent_List.innerHTML = ""; //clearing the previously fetched data

    confessions_sent_array.forEach((element) => {

        // anchor tag for list element
        let this_a = document.createElement("a"); 
        this_a.href = "/Profiles/" + element.Confessed_To;
        this_a.classList.add("list-group-item");  //Adding Bootstrap CSS Classes
        this_a.classList.add("list-group-item-action");
        this_a.classList.add("flex-column");
        this_a.classList.add("align-items-start");
        this_a.classList.add("list-group-item-danger");

        let this_div = document.createElement("div");
        this_div.classList.add("d-flex");
        this_div.classList.add("w-100");
        this_div.classList.add("justify-content-between");
        
        let this_h5_content_heading = document.createElement("h5");
        this_h5_content_heading.classList.add("mb-1");
        this_h5_content_heading.innerHTML = "TO : " + element.Confessed_To;

        let this_small_timestamp = document.createElement("small");
        this_small_timestamp.innerHTML = element.Timestamp;

        let this_p_content = document.createElement("p");
        this_p_content.classList.add("mb-1");
        this_p_content.innerHTML = element.Confession;

        this_div.appendChild(this_h5_content_heading);
        this_div.appendChild(this_small_timestamp);
        this_a.appendChild(this_div);
        this_a.appendChild(this_p_content);
        Confessions_Sent_List.appendChild(this_a); //appending the list anchor to the list
    })

}

function View_Buddy_Requests()
{
    if(Cookies.get("Session_ID") == undefined) //tried accessing through link
        location.href = "./index.html";
    else
    {
        Buddy_Requests_Pallet.hidden = false;
      
        loadOverlay.hidden = false;
        
        axios.get('/fetch_buddy_requests', {headers: {'Authorization': Cookies.get("Session_ID") }}).then(response => {
            
            loadOverlay.hidden = true;
            console.log(response.data);

            if(response.data.Status == "Fail" && response.data.Description == "Invalid Session")
                location.href = "./index.html";
            else
            {
                if(response.data.Status == "Fail")
                    alert(response.data.Description);
                else
                {
                    document.getElementById("Buddy_Requests_Pallet").hidden = false;
                    Display_Buddy_Requests(response.data.Buddy_Requests);
                }
            }
        })
    }
}

function Display_Buddy_Requests(buddy_request_array) {

    let Buddy_Request_list_group = document.getElementById("Buddy_Request_list_group");
    Buddy_Request_list_group.innerHTML = ""; //clearing the previously fetched data
    buddy_request_array.forEach((element) => {
            
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
            this_h5_content_heading.innerHTML = element.Sender_Username;
            
            let this_small_timestamp = document.createElement("small");
            this_small_timestamp.innerHTML = Convert_Timestamp_To_Date(element.Timestamp);
    
            let this_p_content = document.createElement("p");
            this_p_content.classList.add("mb-1");
            this_p_content.innerHTML = "<Button class='btn btn-success' onclick='Accept_Buddy_Request(\"" + element.Sender_Email + "\")'>Accept</Button> <Button class='btn btn-danger' onclick='Reject_Buddy_Request(\"" + element.Sender_Email + "\")'>Reject</Button>";
    
            this_div.appendChild(this_h5_content_heading);
            this_div.appendChild(this_small_timestamp);
            this_a.appendChild(this_div);
            this_a.appendChild(this_p_content);
            Buddy_Request_list_group.appendChild(this_a); //appending the list anchor to the list
    })
}

function Accept_Buddy_Request(sender_email)
{
    
    if(Cookies.get("Session_ID") == undefined) //tried accessing through link
        location.href = "./index.html";
    else
    {  
        loadOverlay.hidden = false;
        
        let Session = {
            Sender : sender_email,
        }

        axios.put('/accept_buddy_request',Session,{headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID")}}).then(response => {
            
            console.log(response.data);
            loadOverlay.hidden = true;

            if(response.data.Status == "Fail" && response.data.Description == "Invalid Session")
                location.href = "./index.html";
            else
            {
                    alert(response.data.Description);
                    window.location.reload();//refresh page
            }  
        })
    }
}

function Reject_Buddy_Request(sender_email) {

    if(Cookies.get("Session_ID") == undefined) //tried accessing through link
        location.href = "./index.html";
    else
    {  
        loadOverlay.hidden = false;
        
        let Session = {
            Sender_Email : sender_email
        }

        axios.put('/reject_buddy_request',Session,{headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID")}}).then(response => {
            
            console.log(response.data);
            loadOverlay.hidden = true;

            if(response.data.Status == "Fail" && response.data.Description == "Invalid Session")
                location.href = "./index.html";
            else
            {
                    alert(response.data.Description);
                    window.location.reload();//refresh page
            }  
        })
    }

  }


Get_Profile_Data();