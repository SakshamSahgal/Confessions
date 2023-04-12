function Submit_Email()
{   
    let Email_Details = {
        Email : document.getElementById("Email_Submit").value
    }

    axios.put('/Forgot_Email_api',Email_Details,{headers: {'Content-Type': 'application/json'}}).then(response => {

        console.log(response.data);
        alert(response.data.Description);
        if(response.data.Status == "Pass")
        {
            document.getElementById("Email_div").hidden = true; //hiding the Email Div
            document.getElementById("OTP_div").hidden = false; //revealing the OTP div
        }

    })

}

function Submit_OTP() //when user submit
{
    let OTP_details = {
        Email : document.getElementById("Email_Submit").value,
        OTP : parseInt(document.getElementById("OTP_Submit").value)
    }

    axios.put('/Forgot_OTP_api',OTP_details,{headers: {'Content-Type': 'application/json'}}).then(response => {
        
        console.log(response.data);
        alert(response.data.Description);
        if(response.data.Status == "Pass")
        {
            document.getElementById("OTP_div").hidden = true; //hiding the OTP div
            document.getElementById("Password_div").hidden = false; //revealing the Password Div
        }
    
    })
}

function Submit_Password()
{
    let Password_Details = {
        Email : document.getElementById("Email_Submit").value,
        OTP : parseInt(document.getElementById("OTP_Submit").value),
        Password : document.getElementById("Password_Submit").value
    }

    axios.put('/Forget_Password_api',Password_Details,{headers: {'Content-Type': 'application/json'}}).then(response => {
        console.log(response.data);
        alert(response.data.Description);
        if(response.data.Status == "Pass")
            location.href = "./index.html";
    })
}