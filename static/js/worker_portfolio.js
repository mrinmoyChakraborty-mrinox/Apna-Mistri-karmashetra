async function chatWithWorker(workerId){

   const res = await fetch("/chat/start",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({workerId})
   })

   // USER NOT LOGGED IN
   if(res.status === 401){
      window.location.href = "/getstarted";
      return;
   }

   const data = await res.json()

   if(data.conversationId){
      window.location.href = `/inbox?cid=${data.conversationId}`
   }
}
async function hireWorker(workerId){

   const res = await fetch("/api/check-auth")

   if(res.status === 401){
      window.location.href = "/getstarted"
      return
   }

   window.location.href = `/create-job?worker_id=${workerId}`
}
function enableEditMode(){

   // NAME
   document.getElementById("nameText").classList.add("hidden");
   document.getElementById("nameInput").classList.remove("hidden");

   // BIO
   document.getElementById("aboutText").classList.add("hidden");
   document.getElementById("aboutInput").classList.remove("hidden");

   // SKILLS
   document.getElementById("skillsDisplay").classList.add("hidden");
   document.getElementById("skillsEdit").classList.remove("hidden");

   // AVAILABILITY
   document.getElementById("availabilityText").classList.add("hidden");
   document.getElementById("availabilityEdit").classList.remove("hidden");

   document.querySelector(".edit-btn").classList.add("hidden");
   document.querySelector(".save-btn").classList.remove("hidden");
}

async function saveProfile(){

   const name = document.getElementById("nameInput").value;
   const bio = document.getElementById("aboutInput").value;

   const skillInputs = document.querySelectorAll("#skillsContainer input");
   const skills = Array.from(skillInputs).map(input => input.value);

   const availability = document.getElementById("availabilityInput").value;
   const working_hours = document.getElementById("workingHoursInput").value;

   // UPDATE NAME
   await fetch("/worker/update-profile",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({field:"name", value:name})
   });

   // UPDATE BIO
   await fetch("/worker/update-profile",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({field:"bio", value:bio})
   });

   // UPDATE SKILLS
   await fetch("/worker/update-profile",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({field:"skills", value:skills})
   });

   // UPDATE AVAILABILITY
   await fetch("/worker/update-profile",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
         field:"availability",
         availability:availability,
         working_hours:working_hours
      })
   });

   location.reload();
}