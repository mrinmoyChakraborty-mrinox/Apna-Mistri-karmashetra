document.addEventListener("DOMContentLoaded", function(){

  const stars = document.querySelectorAll(".stars span");
  let rating = 0;

  stars.forEach((star, index) => {

    star.addEventListener("click", function(){

      rating = index + 1;

      stars.forEach(s => s.classList.remove("active"));

      for(let i = 0; i < rating; i++){
        stars[i].classList.add("active");
      }

      console.log("Selected rating:", rating);

    });

  });

});
let rating = 0;

document.addEventListener("DOMContentLoaded", function(){

  const role = document.getElementById("userRole").value;
  const jobId = document.getElementById("jobId").value;

  if(role === "worker"){
      document.getElementById("beforeSection").style.display="none";
      document.getElementById("reviewSection").style.display="none";
  }

  if(role === "customer"){
      document.getElementById("afterSection").style.display="none";
  }

  const submitBtn = document.querySelector(".submit");

  submitBtn.addEventListener("click", async function(){

      const formData = new FormData();

      if(role === "customer"){
          const review = document.getElementById("reviewText").value;
          const beforeImage = document.getElementById("beforeImage").files[0];

          formData.append("review", review);
          formData.append("rating", rating);
          formData.append("beforeImage", beforeImage);

          await fetch(`/api/job/customer-complete/${jobId}`,{
              method:"POST",
              body:formData
          });

      } else {

          const afterImage = document.getElementById("afterImage").files[0];
          formData.append("afterImage", afterImage);

          await fetch(`/api/job/worker-complete/${jobId}`,{
              method:"POST",
              body:formData
          });
      }

      alert("Submission Successful");
      window.location.href="/dashboard";

  });

});