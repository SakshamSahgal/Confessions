

let loadOverlay = document.getElementById("Load_overlay");
let Profile_Picture_Pallet =  document.getElementById("profile_picture_pallet");



async function SendToServer(JSON_to_Send,Route) //function used to send json to server
{
        let send_package_obj = { //packing it in an object
        method : 'POST' ,
        headers : {
            'Content-Type' : 'application/json' //telling that i am sending a JSON
        } ,
        body : JSON.stringify(JSON_to_Send)
        }
    
        let server_response = await fetch(Route,send_package_obj);
        return await server_response.json()
}

function Logout() //function called when user logs out
{
        if(Cookies.get("Session_ID") == undefined)
            location.href = "./index.html";
        else
        {
            let Session_Data = {
                Session_ID : Cookies.get("Session_ID")
            }
            loadOverlay.hidden = false;  //Revealing the load overlay
            let Server_Response = SendToServer(Session_Data,"/logout_api");
            Server_Response.then((response)=>{
                loadOverlay.hidden = true; //hiding load overlay
                console.log(response);
                if(Cookies.get("Session_ID") != undefined)
                    Cookies.remove("Session_ID");
                location.href = "./index.html";
            })
    }
}

function Update_Username() //function called when user clicks on update username
{
    let Session = {
        Session_ID : Cookies.get("Session_ID"),
        Edit_Username : document.getElementById("Edit_Username").value,
    }

    if(Session.Session_ID == undefined)
        location.href = "./index.html";
    else
    {
        SendToServer(Session,"/Update_Username_api").then((response) => {
            
            console.log(response);            
            

        })
    }

}

function Delete_Account() //function called when user clicks on delete account
{
    let Session = {
        Session_ID : Cookies.get("Session_ID")
    }

    if(Session.Session_ID == undefined)
        location.href = "./index.html";
    else
    {
        loadOverlay.hidden = false;
        SendToServer(Session,"/Delete_Account").then((response)=>{
            loadOverlay.hidden = true;
            console.log(response);
            Cookies.remove("Session_ID");
            if(response.Status == "Invalid Session")
                location.href = "./logged_out.html";
            else
                location.href = "./index.html"; //successfully deleted account
        })
    }
}

function Edit_Profile() //function called when user submits in edit profile
{
    let Session = {
        Session_ID : Cookies.get("Session_ID"),
        Edit_Username : document.getElementById("Edit_Username").value,
        Edit_Bio : document.getElementById("Edit_Bio").value,
        Edit_Gender : ( document.getElementById("Edit_Male").checked  == true ) ? "male" : "female"
    }

    if(Session.Session_ID == undefined)
        location.href = "./index.html";
    else
    {
        console.log(Session);

        loadOverlay.hidden = false; //revealing the load overlay

        SendToServer(Session,"/Edit_Profile_Data_api").then((response) => {
            loadOverlay.hidden = true; //hiding the load overlay again
            console.log(response);

        })
    }
}


function Get_Profile_Data() //function called at the loading of page [fetches the profile page data]
{
    let Session = {
        Session_ID : Cookies.get("Session_ID")
    }

    if(Session.Session_ID == undefined)
        location.href = "./index.html";
    else
    {
        loadOverlay.hidden = false;
        SendToServer(Session,"/Profile_Page_api").then((response) => {
            loadOverlay.hidden = true;
            console.log(response);
            if(response.Status != "Pass")
                location.href = "./logged_out.html";
            else
            {
                document.getElementById("Profile_Photo").src = response.Profile_Picture;
                document.getElementById("user_bio").textContent = response.Bio;
                document.getElementById("User_Gender").textContent = response.Gender;
                document.getElementById("Username").textContent = response.Username;
                document.getElementById("profile_picture").src = response.Profile_Picture; //top right photo
                initialize_edit_data(response.Username,response.Bio,response.Gender);
            }
        })
    }
}


function Change_Profile_Picture() //function called when change profile picture is clicked [function displays the list of available profile pictures]
{
    let Session = {
        Session_ID : Cookies.get("Session_ID")
    }
    
    if(Session.Session_ID == undefined)
        location.href = "./index.html";
    else
    {
        Profile_Picture_Pallet.hidden = false;
        loadOverlay.hidden = false; //revealing the loadOverlay
        SendToServer(Session,"/fetch_Profile_Pictures_api").then((response) => {
            loadOverlay.hidden = true; //Hiding the loadOverlay
            console.log(response);

            if(response.Status != "Pass")
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

                for(var i=0;i<response.Paths.length;i++)
                {
                    let this_col = document.createElement("div"); //creating a col div
                    this_col.classList.add("col-md-4"); //Adding Bootstrap CSS
                    this_col.classList.add("rounded"); //Adding Bootstrap CSS
                    this_col.classList.add("p-3"); //Adding Bootstrap CSS

                    let img_holder_div = document.createElement("div");
                    img_holder_div.classList.add("p-3"); //padding 3 to the image holder div
                    img_holder_div.classList.add("border");
                    img_holder_div.classList.add("rounded");

                    if(response.Paths[i] == response.Current_Profile_Picture) //changing the background color for the already selected profile picture
                        img_holder_div.style.backgroundColor = "rgba(122, 255, 168, 0.237)";
                    else
                        img_holder_div.style.backgroundColor = "rgba(255, 255, 255, 0.237)";

                    img_holder_div.align = "center";

                    let this_img = document.createElement("img");
                    this_img.src = response.Paths[i];



                    this_img.style.maxWidth = "100%";
                    this_img.style.maxHeight = "100%";

                    this_img.addEventListener("click",Select_Profile_Picture.bind(null,response.Paths[i])); //Adding click event listener to image
                    
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
        });
    }
}

function close_Profile_Pallet() //called when close button is pressed
{
    Profile_Picture_Pallet.hidden = true;
}

function Select_Profile_Picture(profile_picture_path) //function called when user selects a profile picture (clicks on it)
{
    console.log(profile_picture_path);
    
    Update={
        Session_ID : Cookies.get("Session_ID"),
        Profile_Picture : profile_picture_path
    }

    SendToServer(Update,"/update_profile_picture_api").then((response) => {
        console.log(response);
        if(response.Status != "Success")
            location.href = "./logged_out.html";
        else
            Refresh_Page();
    })

}

function Refresh_Page()//function just refreshes the page
{
    location.href = "./Profiles.html";
}

function Remove_Profile_Picture() //function called when user clicks on remove profile picture
{
    let Session = {
        Session_ID : Cookies.get("Session_ID")
    }

    SendToServer(Session,"/Remove_Profile_Picture_api").then((response) => {
        console.log(response);
        if(response.Status == "Success")
                Refresh_Page();
    })
}


function initialize_edit_data(username,bio,gender) //function that sets the initial value of edit data
{
    document.getElementById("Edit_Username").value = username;
    document.getElementById("Edit_Bio").value = bio;
    if(gender == "male")
        document.getElementById("Edit_Male").checked = true;
    else
        document.getElementById("Edit_Female").checked = true;
}

Get_Profile_Data();
