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
                // document.getElementsByClassName("previewThemeProfilePicture").src = response.data.Profile_Picture;
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
    
}


function fetchPost()
{
    textgot = "asdasdsa asd asdasasdasdsa asd asdasasdasdsa asdsada "
    post.postText.innerText = textgot
    console.log(post.postText.textContent.length)

    post.postcharCount.innerText =  (post.postText.textContent.length ) + "/280";

    if (post.postText.textContent.length > 100) {
        post.postText.style.fontSize = '18px';
      } else if (post.postText.textContent.length > 50) {
        post.postText.style.fontSize = '25px';
      } else {
        post.postText.style.fontSize = '30px';
      }
}

fetchPost(); //function that fetches the content from the backend
Fetch_Dashboard();

//react 


// When the user clicks a reaction button, handle the reaction
function react(emoji) {
    // Handle the reaction
    alert(emoji)
}
