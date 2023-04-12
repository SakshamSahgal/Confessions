let loadOverlay = document.getElementById("Load_overlay");

function Register_Email()
{
    let Register = {
    Email : document.getElementById("register_email").value,
    }
    console.log(Register);
    loadOverlay.hidden = false;

    axios.post('/Register_Email_api',Register).then(response => {

        loadOverlay.hidden = true;
        console.log(response.data);   
        if(response.data.Status == "Pass")
        {
            document.getElementById("Register_Email_Div").hidden = true; //hiding email div
            document.getElementById("Register_Username_Div").hidden = false; //revealing username div
        }
        else
            alert(response.data.Description);     

    })         
}

function Register_Username()
{
    let Register = {
        Email : document.getElementById("register_email").value,
        Username : document.getElementById("register_username").value
    }
    
    loadOverlay.hidden = false;

    axios.put('/Register_Username_api',Register).then(response => {
        
        loadOverlay.hidden = true;
        console.log(response.data);
        
        if(response.data.Status == "Pass")
        {
            document.getElementById("Register_Username_Div").hidden = true; //hiding username div
            document.getElementById("Register_OTP_Div").hidden = false; //revealing OTP div
        }
        else
            alert(response.data.Description);
    })

}

function Register_OTP()
{
    let Register = {
        Email : document.getElementById("register_email").value,
        Username : document.getElementById("register_username").value,
        OTP : document.getElementById("register_otp").value
    }
    loadOverlay.hidden = false;

    axios.put('/Register_OTP_api',Register).then(response => {
        
        console.log(response.data);
        loadOverlay.hidden = true;

        if(response.data.Status == "Pass")
        {
            document.getElementById("Register_OTP_Div").hidden = true;//hiding OTP div
            document.getElementById("Register_Password_Div").hidden = false;//revealing register password div
        }
        else
            alert(response.data.Description);
    })

}


function Register_Password()
{
    let Register = {
        Email : document.getElementById("register_email").value,
        Username : document.getElementById("register_username").value,
        Password :document.getElementById("register_password").value
    }

    axios.put('/Register_Password_api',Register).then(response => {
        console.log(response.data);
        if(response.data.Status == "Pass")
        {
            alert(response.data.Description);
            window.location.reload();//refresh page
        }
        else
            alert(response.data.Description);
    })

}

function Log_in() //Logs in User
{
    let Login_Credentials = { //getting the crenditials from the input field
        Email : document.getElementById("login_email").value,
        Password : document.getElementById("login_pass").value
    }
    
    console.log(Login_Credentials);
    loadOverlay.hidden = false; //revealing the load overlay

    axios.put('/auth_api',Login_Credentials).then(response => {
        console.log(response.data);
        loadOverlay.hidden = true; //hiding the load overlay

        if(response.data.Status == "Pass")
        {
            Cookies.set("Session_ID",response.data.Session.Session_ID,{ expires: 30 });
            location.href = "./Dashboard.html";
        }
        else
            alert(response.data.Description);

    })
}


    function Validate_Session() //checks if the user is already logged in
    {
        if(Cookies.get("Session_ID") != undefined )
        {
            loadOverlay.hidden = false; //revealing the load overlay

            axios.put('/validate_session_api',{},{headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID")}}).then(response => {
                
                console.log(response.data);
                loadOverlay.hidden = true; //Hiding the load overlay

                if(response.data.Status == "Session Matched")
                    location.href = "./Dashboard.html";
                else
                   Cookies.remove("Session_ID");
            })
        }
    }

Validate_Session();