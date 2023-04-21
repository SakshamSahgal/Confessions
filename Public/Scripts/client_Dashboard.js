let loadOverlay = document.getElementById("Load_overlay");

let dashboardFetchedData;

let headerThemes = {
    themePallet : document.getElementById("themesOverlay"),
    themeTabList : document.getElementById("themeTabList"),
    themeTabContent : document.getElementById("themeTabContent")
}

let previewPost = {
    placeholderText : document.getElementById("postTextPreview").innerText,
    previewHeader : document.getElementById("previewPostCardHeader"),
    previewProfilePicture : document.getElementById("previewProfilePicture"),
    previewName : document.getElementById("previewName"),
    previewEmail : document.getElementById("previewEmail"),
    moodBadge : document.getElementById("moodBadge"),
    charCount : document.getElementById("charCount"),
    postTextPreview : document.getElementById("postTextPreview"),
    selectedHeaderBackground : ''
}

let Moods = {
    moodPallet : document.getElementById("moodOverlay"),
    moodTabList : document.getElementById("moodTabList"),
    moodTabContent : document.getElementById("moodTabContent"),
    moodBadgeHolderDiv : document.getElementById("moodBadgeHolderDiv"),
    moodBadge : document.getElementById("moodBadge")
}

//poll

let poll = {
    pollOptions : document.getElementById("pollOptions")
}

let post = {
    postProfilePicture : document.getElementById("postProfilePicture"),
    postText : document.getElementById("postText"),
    postName : document.getElementById("postName"),
    postEmail : document.getElementById("postEmail"),
    postcharCount : document.getElementById("postcharCount"),
}

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


function Fetch_Dashboard() //function called at the page load [fetches dashboard content]
{
    if(Cookies.get("Session_ID") == undefined) //accesing via link
        location.href = "./index.html";
    else
    {
        loadOverlay.hidden = false;

        axios.get('/Fetch_Dashboard_api',{headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID")}}).then(response => {
            console.log(response.data);
            loadOverlay.hidden = true;
            dashboardFetchedData = response.data;
            if(response.data.Status == "Pass")
            {
                document.getElementById("profile_picture").src = response.data.Profile_Picture; //setting the top right profile picture
                previewPost.previewProfilePicture.src = response.data.Profile_Picture; //setting the preview post profile picture
                previewPost.previewName.textContent = response.data.Username;
                previewPost.previewEmail.textContent = response.data.Email;
                displayPostsnPolls(response.data.PostsArray);
            }
            else
                alert(response.data.Description);
        })
    }
}




 previewPost.postTextPreview.addEventListener("focusin",()=>{
    if(previewPost.postTextPreview.textContent == previewPost.placeholderText)
    {
            previewPost.postTextPreview.textContent = ""
         if(previewPost.postTextPreview.classList.contains("postTextPreviewPlaceHolder"))
            previewPost.postTextPreview.classList.remove("postTextPreviewPlaceHolder")
         if(previewPost.postTextPreview.classList.contains("postTextPreviewContent") == false)
            previewPost.postTextPreview.classList.add("postTextPreviewContent")
    }
    else if(previewPost.postTextPreview.textContent == "")
    {
            previewPost.postTextPreview.textContent = previewPost.placeholderText
         if(previewPost.postTextPreview.classList.contains("postTextPreviewPlaceHolder") == false)
            previewPost.postTextPreview.classList.add("postTextPreviewPlaceHolder")
         if(previewPost.postTextPreview.classList.contains("postTextPreviewContent"))
            previewPost.postTextPreview.classList.remove("postTextPreviewContent")
    }
 })

 previewPost.postTextPreview.addEventListener("focusout",()=>{
    if(previewPost.postTextPreview.textContent == previewPost.placeholderText)
    {
         if(!previewPost.postTextPreview.classList.contains("postTextPreviewPlaceHolder"))
            previewPost.postTextPreview.classList.add("postTextPreviewPlaceHolder")
         if(previewPost.postTextPreview.classList.contains("postTextPreviewContent"))
            previewPost.postTextPreview.classList.remove("postTextPreviewContent")
    }
    else if(previewPost.postTextPreview.textContent == "")
    {
            previewPost.postTextPreview.textContent = previewPost.placeholderText
         if(!previewPost.postTextPreview.classList.contains("postTextPreviewPlaceHolder"))
            previewPost.postTextPreview.classList.add("postTextPreviewPlaceHolder")
         if(previewPost.postTextPreview.classList.contains("postTextPreviewContent"))
            previewPost.postTextPreview.classList.remove("postTextPreviewContent")
    }
 })

 previewPost.postTextPreview.addEventListener("input",()=>{ //function called when user enters anything on the preview post
    // console.log(previewPost.postTextPreview.textContent.length)
    previewPost.charCount.innerText = previewPost.postTextPreview.textContent.length + "/" + 280;
 })
 
 function Update_Info_Details() //called when user changes visibility
 {
    let visibilityInfo = document.getElementById("visibility_info");
    let previewName = document.getElementById("previewName");
    let previewEmail = document.getElementById("previewEmail");
    let previewProfilePicture = document.getElementById("previewProfilePicture");
    let previewThemeProfilePicture = document.getElementsByClassName("previewThemeProfilePicture")

    const images = document.querySelectorAll('.my-image');
    images.forEach(image => {
    image.src = 'new-image.jpg';
    });

     if(document.getElementById("visibility_Select").value == "Buddies-Only")
     {
        previewName.textContent = dashboardFetchedData.Username;
        previewEmail.textContent = dashboardFetchedData.Email;
        previewProfilePicture.src = dashboardFetchedData.Profile_Picture;
        previewThemeProfilePicture.src = dashboardFetchedData.Profile_Picture;
        visibilityInfo.innerHTML = "[People who Buddied you, will know you posted this]"
     }
     else if(document.getElementById("visibility_Select").value == "Global")
     {
        previewName.textContent = dashboardFetchedData.Username;
        previewEmail.textContent = dashboardFetchedData.Email;
        previewProfilePicture.src = dashboardFetchedData.Profile_Picture;
        previewThemeProfilePicture.src = dashboardFetchedData.Profile_Picture;
        visibilityInfo.innerHTML = "[Post is visible to anyone who visits your profile]"
     }
     else
     {
         previewName.textContent = "Anonymous";
         previewEmail.textContent = "@anonymous";
         previewProfilePicture.src = "./GUI_Resources/anonymous.jpg"
         previewThemeProfilePicture.src = "./GUI_Resources/anonymous.jpg"
         visibilityInfo.innerHTML = "[No one will know you posted this]"
     }
 }

 function FetchHeaders() {
     
    if(Cookies.get("Session_ID") == undefined) //accesing via link
        location.href = "./index.html";
    else
    {
        loadOverlay.hidden = false;
        axios.get('/fetch_themes',{headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID")}}).then(response => {
            
            console.log(response.data);
            loadOverlay.hidden = true;
            
            if(response.data.Status == "Fail" && response.data.Description == "Invalid Session")
                location.href = "./index.html"
            else
            {
                displayHeaders(response.data.headers)
            }
        })

        document.getElementById("themesOverlay").hidden = false;
    }
}

//Post ----------------------------------------------------------------------------------------------------------------------------------------

function Post_it()
{
    if(Cookies.get("Session_ID") == undefined)
        location.href = "./index.html";
    else
    {
        //loadOverlay.hidden = false;

        let postJSON = {
            visibility : document.getElementById("visibility_Select").value,
            content : (document.getElementById("postTextPreview").innerText == previewPost.placeholderText) ? '' : (document.getElementById("postTextPreview").innerText),
            moodBadge : (Moods.moodBadgeHolderDiv.hidden == true) ? '' : Moods.moodBadge.innerText,
            postHeader : {
                headerThemeBackground : previewPost.selectedHeaderBackground,
                usernameFontColor : (document.getElementById("previewName").style.color),
                emailFontColor : (document.getElementById("previewEmail").style.color)
            }
        }

        console.log(postJSON)
        loadOverlay.hidden = false;
        axios.post('/postIt', postJSON, {headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID")}}).then(response => {
            console.log(response.data);
            loadOverlay.hidden = true;
            //alert(response.data.Description);
        })
    }
}

function removeThemes() { //function called when someone presses remove header button
    
    previewPost.selectedHeaderBackground = ''  //assigning empty string
    previewPost.previewEmail.style.color = ""; //setting back to default color
    previewPost.previewName.style.color = ""; //setting back to default color

    previewPost.previewHeader.style.backgroundImage = `url(${''})`; //removing background image from preview header
    headerThemes.themePallet.hidden = true;
}


function selectHeader(headerData) { 
    //selectedHeaderData = JSON.parse(headerData)
    console.log(headerData.path)
    previewPost.selectedHeaderBackground = (headerData.path.split('/').pop()).split('.')[0]  //assigning the name of the selected background [last element in the splited array of path] (after that removing the .jpg using split '.')
    previewPost.previewHeader.style.backgroundImage = `url(${headerData.path})`;
    previewPost.previewName.style.color = headerData.HeaderFontColor;
    previewPost.previewEmail.style.color = headerData.HeaderFontColor;
    headerThemes.themePallet.hidden = true;
 }


function displayHeaders(headersJSON){

    let active = false; ///used as a active flag
    headerThemes.themeTabList.innerHTML = "" //clearing previously fetched data
    headerThemes.themeTabContent.innerHTML = "" //clearing previously fetched data

    for (let [ThemeName, themeBackgrounds] of Object.entries(headersJSON)) { //iterating over JSON keys and values

        //console.log(ThemeName + ": ");
        
        let headerTabs;
        let tabContentDiv;

        if(active == false){

            headerTabs = `<li class='nav-item'> 
                            <a href='#${ThemeName}' class='nav-link active' data-bs-toggle='tab'> ${ThemeName}  </a> 
                            </li>`
            tabContentDiv = `<div class='tab-pane show active justify-content-center align-items-center' id='${ThemeName}'> 
                            </div>`
            
            active = true
        }
        else
        {
            headerTabs = `<li class='nav-item'> 
                            <a href='#${ThemeName}' class='nav-link' data-bs-toggle='tab'> ${ThemeName}  </a> 
                            </li>`
            tabContentDiv = `<div class='tab-pane show justify-content-center align-items-center' id='${ThemeName}'> 
                            </div>`

        }
        
        headerThemes.themeTabList.innerHTML += headerTabs
        headerThemes.themeTabContent.innerHTML += tabContentDiv


        themeBackgrounds.forEach( thisThemeBackground => { //iterating over backgrounds
            
            //console.log(thisThemeBackground)

            let thisHeaderStyle = `<div class='row my-3'>
                                        <div class='col' onclick='selectHeader(${JSON.stringify(thisThemeBackground)})' >
                                            <div class='card highlight-on-hover'>
                                                <div class='card-header' style=' background-size: cover; background-image: url(${thisThemeBackground.path});'>
                                                    <div class='d-flex align-items-center'> 
                                                        <img src="${dashboardFetchedData.Profile_Picture}" alt='Profile Picture' class='rounded-circle me-3 previewThemeProfilePicture' width='50'>
                                                            <div>   
                                                                <h5 class='m-0 headerText' style='color: ${thisThemeBackground.HeaderFontColor};'> ${dashboardFetchedData.Username} </h5>
                                                                <small class='headerText' style=' color: ${thisThemeBackground.HeaderFontColor};'> ${dashboardFetchedData.Email} </small>
                                                            </div> 
                                                    </div> 
                                                </div> 
                                            </div> 
                                        </div> 
                                    </div>`;

            document.getElementById(ThemeName).innerHTML += thisHeaderStyle;
        })
    }

}

 //----------------------------------------------------------------------------------------------------------------------------------------------------------------

function fetchMoods()
{
    Moods.moodPallet.hidden = false;
    if(Cookies.get("Session_ID") == undefined) //accesing via link
        location.href = "./index.html";
    else
    {
        loadOverlay.hidden = false;

        axios.get('/fetchMoods',{headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID")}}).then(response => {
            
            loadOverlay.hidden = true;
            console.log(response.data)
            displayMoodPallet(response.data.moods)

        })
    }
}

function removeMoodBadge() {
    Moods.moodBadgeHolderDiv.hidden = true;
    previewPost.moodBadge.title = 'N/A';
    previewPost.moodBadge.innerHTML = "";
    Moods.moodPallet.hidden = true;
}

function selectMood(thisMoodJSON) { //function called when user selects a mood badge
    console.log(thisMoodJSON);
    Moods.moodBadgeHolderDiv.hidden = false;
    previewPost.moodBadge.title = thisMoodJSON.name;
    previewPost.moodBadge.innerHTML = thisMoodJSON.emoji;
    Moods.moodPallet.hidden = true;
}

function displayMoodPallet(moods)
{
    let active = false; ///used as a active flag

    Moods.moodTabList.innerHTML = "";
    Moods.moodTabContent.innerHTML = "";

    for (let [moodName, entriesOfThatMood] of Object.entries(moods)) {

        //console.log(moodName + ": ");
        
        let MoodTabs;
        let tabContentDiv;
        
        if(active == false){
            
            MoodTabs = `<li class='nav-item'> 
                        <a href='#${moodName}' class='nav-link active' data-bs-toggle='tab'>${moodName}</a> 
                        </li>`

            tabContentDiv =  `<div class='tab-pane show active justify-content-center align-items-center' id='${moodName}'>
                              </div>`
            active = true
        }
        else
        {
            MoodTabs = `<li class='nav-item'> 
                        <a href='#${moodName}' class='nav-link' data-bs-toggle='tab'>${moodName}</a> 
                        </li>`

            tabContentDiv = `<div class='tab-pane show justify-content-center align-items-center' id='${moodName}'> 
                            </div>`
        }
     
        
        Moods.moodTabList.innerHTML += MoodTabs
        Moods.moodTabContent.innerHTML += tabContentDiv
        
        
        entriesOfThatMood.forEach( thisMood => { //iterating over Entries in this mood
            
            //console.log(thisMood)
            
            thisMoodBadge = `<div class= 'row my-3 bg-secondary d-flex justify-content-center align-items-center' >
                                <div class='col highlight-on-hover d-flex justify-content-center align-items-center' onclick='selectMood(${JSON.stringify(thisMood)})'>
                                    <span class='badge' style='font-size: 32px;' title='moodStatus'> ${thisMood.emoji} </span> &nbsp; <span>${thisMood.name}</span>
                                </div> 
                             </div>`

            document.getElementById(moodName).innerHTML += thisMoodBadge; //appending this mood badge in the list to display

        })
      }
}



function closePallet(id) //function to close overlay pallets by id passed to it
{
    document.getElementById(id).hidden = true;
}

function viewPallet(id) //function that reveals the pallet by id passed to it
{
    document.getElementById(id).hidden = false;
}



var pollOptionCount = 3;

function addPollOption() {
  var newPollOptionHtml = `
    <div class="form-group" id='formOptions${pollOptionCount}'>
      <label for="poll-option${pollOptionCount}" class="poll-option-label">Option ${pollOptionCount}:</label>
      <input type="text" class="form-control poll-option" id="poll-option${pollOptionCount}" placeholder="Enter option">
    </div>`;

  poll.pollOptions.innerHTML += newPollOptionHtml;
  pollOptionCount++;
}

function ReducePollOptions()
{
    if(pollOptionCount == 3)
        alert("cannot Remove Anymore Options")
    else
    {
        pollOptionCount--;
        var divToDelete = document.getElementById("formOptions" + pollOptionCount);
        divToDelete.remove();
    }
}

function submitPoll()
{
    alert("This Feature is under Development");
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


function displayPostsnPolls(posts)
{

    posts.sort(() => Math.random() - 0.5); //randomizing the posts on client side

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
                                
                document.getElementById("postsList").innerHTML += thisPostHtml;
         }
         else
         {

         }
    })
}

Fetch_Dashboard();

