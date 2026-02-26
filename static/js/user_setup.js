document.getElementById("userSetupForm").addEventListener("submit", async function(e){

    e.preventDefault();

    const form = document.getElementById("userSetupForm");
    const formData = new FormData(form);

    try {

        const res = await fetch("/user/setup", {
            method: "POST",
            body: formData
        });

        if(res.ok){
            window.location.href = "/customer/dashboard";
        } else {
            alert("Failed to save profile");
        }

    } catch(err){
        alert("Network error");
    }

});
