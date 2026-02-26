const steps = document.querySelectorAll(".form-step");
const nextBtns = document.querySelectorAll(".next-btn");
const prevBtns = document.querySelectorAll(".prev-btn");
const stepNumber = document.getElementById("step-number");

let currentStep = 0;
const tradeSelect = document.getElementById("tradeSelect");
const tradeOther = document.getElementById("tradeOther");

tradeSelect.addEventListener("change", function() {
    if(this.value === "Other"){
        tradeOther.style.display = "block";
        tradeOther.required = true;
    } else {
        tradeOther.style.display = "none";
        tradeOther.required = false;
    }
});

const experienceSelect = document.getElementById("experienceSelect");
const experienceOther = document.getElementById("experienceOther");

experienceSelect.addEventListener("change", function() {
    if(this.value === "Other"){
        experienceOther.style.display = "block";
        experienceOther.required = true;
    } else {
        experienceOther.style.display = "none";
        experienceOther.required = false;
    }
});

function showStep(step) {
    steps.forEach((s, i) => {
        s.classList.remove("active");
        if (i === step) s.classList.add("active");
    });
    stepNumber.textContent = step + 1;
}

nextBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        if (currentStep < steps.length - 1) {
            currentStep++;
            showStep(currentStep);
        }
    });
});

prevBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    });
});

/* PHOTO PREVIEW */
document.getElementById("photoInput").addEventListener("change", function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById("photoPreview");

    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            preview.src = event.target.result;
            preview.style.display = "block";
        }
        reader.readAsDataURL(file);
    }
});

document.getElementById("onboardingForm").addEventListener("submit", async function(e){

    e.preventDefault();

    const form = document.getElementById("onboardingForm");
    const formData = new FormData(form);

    try {

        const res = await fetch("/worker/onboarding", {
            method: "POST",
            body: formData
        });

        if(res.ok){
            window.location.href = "/worker/dashboard";
        }
        else{
            alert("Failed to save profile");
        }

    } catch(err){
        alert("Network error");
    }

});

