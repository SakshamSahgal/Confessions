let loadOverlay = document.getElementById("Load_overlay");

let dashboardFetchedData;

let headerThemes = {
    themePallet : document.getElementById("themesOverlay"),
    themeTabList : document.getElementById("themeTabList"),
    themeTabContent : document.getElementById("themeTabContent")
}

let previewPost = {
    previewHeader : document.getElementById("previewPostCardHeader"),
    previewProfilePicture : document.getElementById("previewProfilePicture"),
    previewName : document.getElementById("previewName"),
    previewEmail : document.getElementById("previewEmail"),
    moodBadge : document.getElementById("moodBadge")
}

let Moods = {
    moodPallet : document.getElementById("moodOverlay"),
    moodTabList : document.getElementById("moodTabList"),
    moodTabContent : document.getElementById("moodTabContent"),
    moodBadgeHolderDiv : document.getElementById("moodBadgeHolderDiv")
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

// function Post_it()
// {
//     if(Cookies.get("Session_ID") == undefined)
//         location.href = "./index.html";
//     else
//     {
//         loadOverlay.hidden = false;

//         let JSON_to_Send = {
//             Visibility : document.getElementById("visibility_Select").value,
//             Content : document.getElementById("Post_Content").value
//         }

//         axios.post('/Post_it_api', JSON_to_Send, {headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID")}}).then(response => {
//             console.log(response.data);
//             loadOverlay.hidden = true;
//             alert(response.data.Description);
//         })
//     }
// }


 //accessing postTextPreview 
 let postTextPreview = document.getElementById("postTextPreview");

 postTextPreview.addEventListener("focusin",()=>{
    if(postTextPreview.textContent == "I am feeling happy today....")
    {
         postTextPreview.textContent = ""
         if(postTextPreview.classList.contains("postTextPreviewPlaceHolder"))
             postTextPreview.classList.remove("postTextPreviewPlaceHolder")
         if(postTextPreview.classList.contains("postTextPreviewContent") == false)
             postTextPreview.classList.add("postTextPreviewContent")
    }
    else if(postTextPreview.textContent == "")
    {
         postTextPreview.textContent = "I am feeling happy today...."
         if(postTextPreview.classList.contains("postTextPreviewPlaceHolder") == false)
             postTextPreview.classList.add("postTextPreviewPlaceHolder")
         if(postTextPreview.classList.contains("postTextPreviewContent"))
             postTextPreview.classList.remove("postTextPreviewContent")
    }
 })

 postTextPreview.addEventListener("focusout",()=>{
    if(postTextPreview.textContent == "I am feeling happy today....")
    {
         if(!postTextPreview.classList.contains("postTextPreviewPlaceHolder"))
             postTextPreview.classList.add("postTextPreviewPlaceHolder")
         if(postTextPreview.classList.contains("postTextPreviewContent"))
             postTextPreview.classList.remove("postTextPreviewContent")
    }
    else if(postTextPreview.textContent == "")
    {
         postTextPreview.textContent = "I am feeling happy today...."
         if(!postTextPreview.classList.contains("postTextPreviewPlaceHolder"))
             postTextPreview.classList.add("postTextPreviewPlaceHolder")
         if(postTextPreview.classList.contains("postTextPreviewContent"))
             postTextPreview.classList.remove("postTextPreviewContent")
    }
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

     if(document.getElementById("visibility_Select").value == "Public")
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
        visibilityInfo.innerHTML = "[Post is visible to everyone]"
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

 function closeThemesOverlayPallet()
 {
     document.getElementById("themesOverlay").hidden = true;
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

function viewPostOverlay() {
    document.getElementById("Post_Overlay").hidden = false;
}


Fetch_Dashboard();

function closePostOverlay()
{
    document.getElementById("Post_Overlay").hidden = true;
}

function displayHeaders(headersJSON){

    let active = false; ///used as a active flag
    headerThemes.themeTabList.innerHTML = "" //clearing previously fetched data
    headerThemes.themeTabContent.innerHTML = "" //clearing previously fetched data

    for (let [ThemeName, themeBackgrounds] of Object.entries(headersJSON)) { //iterating over JSON keys and values

        console.log(ThemeName + ": ");
        
        let headerTabs;
        let tabContentDiv;

        if(active == false){
            headerTabs = "<li class='nav-item'> <a href='#" + ThemeName  +"' class='nav-link active' data-bs-toggle='tab'> " + ThemeName  + " </a> </li>"
            tabContentDiv = "<div class='tab-pane show active justify-content-center align-items-center' id='" + ThemeName  + "'> </div>"
            active = true
        }
        else
        {
            headerTabs = "<li class='nav-item'> <a href='#" + ThemeName + "' class='nav-link' data-bs-toggle='tab'> " + ThemeName  + " </a> </li>"
            tabContentDiv = "<div class='tab-pane show justify-content-center align-items-center' id='" + ThemeName  + "'> </div>"
        }

        
        
        headerThemes.themeTabList.innerHTML += headerTabs
        headerThemes.themeTabContent.innerHTML += tabContentDiv


        themeBackgrounds.forEach( thisThemeBackground => { //iterating over backgrounds
            
            console.log(thisThemeBackground)

            let thisHeaderStyle = "<div class='row my-3'><div class='col' onclick='selectHeader(" + JSON.stringify(thisThemeBackground) + ")' ><div class='card highlight-on-hover'><div class='card-header' style=' background-size: cover; background-image: url( "  + thisThemeBackground.path + ");'><div class='d-flex align-items-center'><img src=" + dashboardFetchedData.Profile_Picture  + " alt='Profile Picture' class='rounded-circle me-3 previewThemeProfilePicture' width='50'><div><h5 class='m-0 headerText' style='color: " + thisThemeBackground.HeaderFontColor  +";'> " + dashboardFetchedData.Username + " </h5><small class='headerText' style=' color: " + thisThemeBackground.HeaderFontColor  + ";'>" +  dashboardFetchedData.Email + "</small></div> </div> </div> </div> </div> </div>";
            document.getElementById(ThemeName).innerHTML += thisHeaderStyle;


        })
      }

}

function selectHeader(headerData) { 
    //selectedHeaderData = JSON.parse(headerData)
    console.log(headerData.path)
    previewPost.previewHeader.style.backgroundImage = "url('" + headerData.path + "')";
    previewPost.previewName.style.color = headerData.HeaderFontColor;
    previewPost.previewEmail.style.color = headerData.HeaderFontColor;
    headerThemes.themePallet.hidden = true;
 }


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

function removeThemes() { //function called when someone presses remove header button
    previewPost.previewHeader.style.backgroundImage = "none"; //removing background image from previewa header
    previewPost.previewEmail.style.color = "Black"; //setting back to default color
    previewPost.previewName.style.color = "Black"; //setting back to default color
    headerThemes.themePallet.hidden = true;
}

function closeMoodOverlayPallet() {
    Moods.moodPallet.hidden = true;
}

  
function displayMoodPallet(moods)
{
    let active = false; ///used as a active flag

    Moods.moodTabList.innerHTML = "";
    Moods.moodTabContent.innerHTML = "";

    for (let [moodName, entriesOfThatMood] of Object.entries(moods)) {

        console.log(moodName + ": ");
        
        let MoodTabs;
        let tabContentDiv;

        if(active == false){
            MoodTabs = "<li class='nav-item'> <a href='#" + moodName  +"' class='nav-link active' data-bs-toggle='tab'> " + moodName  + " </a> </li>"
            tabContentDiv =  "<div class='tab-pane show active justify-content-center align-items-center' id='" + moodName +"'></div>"
            active = true
        }
        else
        {
            MoodTabs = "<li class='nav-item'> <a href='#" + moodName + "' class='nav-link' data-bs-toggle='tab'> " + moodName  + " </a> </li>"
            tabContentDiv = "<div class='tab-pane show justify-content-center align-items-center' id='" + moodName +"'></div>"
        }
     
        
        Moods.moodTabList.innerHTML += MoodTabs
        Moods.moodTabContent.innerHTML += tabContentDiv
        

        entriesOfThatMood.forEach( thisMood => { //iterating over Entries in this mood
            
            console.log(thisMood)
            thisMoodBadge = "<div class= 'row my-3 bg-secondary d-flex justify-content-center align-items-center' ><div class='col highlight-on-hover d-flex justify-content-center align-items-center' onclick='selectMood(" + JSON.stringify(thisMood) + ")' ><span class='badge' style='font-size: 32px;' title='moodStatus'> " + thisMood.emoji +" </span> &nbsp; <span>" + thisMood.name +"</span></div> </div>"
            document.getElementById(moodName).innerHTML += thisMoodBadge;

        })
      }
}

function removeMoodBadge( ) {

    previewPost.moodBadge.title = "N/A";
    previewPost.moodBadge.innerHTML = "";
    Moods.moodBadgeHolderDiv.hidden = false;
    Moods.moodPallet.hidden = true;
}

function selectMood(thisMoodJSON) { //function called when user selects a mood badge
    console.log(thisMoodJSON);
    Moods.moodBadgeHolderDiv.hidden = false;
    previewPost.moodBadge.title = thisMoodJSON.name;
    previewPost.moodBadge.innerHTML = thisMoodJSON.emoji;
    Moods.moodPallet.hidden = true;
}