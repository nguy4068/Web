window.addEventListener("load", function start(){
    var form = document.getElementById("form");
    form.onsubmit = function(e){
        e.preventDefault();
        var name = $("#name").val();
        var pw = $("#password").val();
        console.log(name);
        console.log(pw);
        $.ajax({
            url: "/checkCredential",
            type: "post", //send it through get method
            data: { 
              username: name,
              password: pw
            },
            success: function(response) {
                if (response.result === "valid"){
                    console.log("valid");
                    window.location.href = "/AllContacts";
                    console.log(response.name);
                }else{
                    console.log("Invalid credential");
                    let box = document.getElementById("invalid");
                    box.innerHTML = "<p class='errormessage'>Invalid credentials. Please try again!</p>";
                }
              //Do Something
            },
            error: function(xhr) {
              //Do Something to handle error
            }
        });
    }

})
