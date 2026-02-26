/* =====================================================
   CREATE JOB PAGE – FINAL CLEAN JS (GLASS VERSION)
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ================= DOM REFERENCES ================= */

    const form = document.getElementById("createJobForm");

    const jobTitle = document.getElementById("jobTitle");
    const customJobTitle = document.getElementById("customJobTitle");

    const timeSlot = document.getElementById("timeSlot");
    const customTimeSlot = document.getElementById("customTimeSlot");

    const description = document.getElementById("description");
    const charCount = document.getElementById("charCount");

    const agreementCheck = document.getElementById("agreementCheck");
    const submitBtn = document.getElementById("submitBtn");

    const locationInput = document.getElementById("jobLocation");
    const editLocationBtn = document.getElementById("editLocationBtn");

    const fileInput = document.getElementById("photoInput");
    const uploadArea = document.getElementById("uploadArea");
    const photoPreview = document.getElementById("photoPreview");
    const photoCount = document.getElementById("photoCount");

    const workerIdInput = document.getElementById("workerId");
    const backBtn = document.getElementById("backBtn");
    console.log("Back button:", backBtn);
    /* ================= 1️⃣ WORKER ID ================= */

    const params = new URLSearchParams(window.location.search);
    const workerId = params.get("worker_id");
    if (workerIdInput) workerIdInput.value = workerId || "";

/* ================= 2️⃣ BACK BUTTON FUNCTION ================= */

    if (backBtn) {
        backBtn.addEventListener("click", function () {

            if (workerId) {
                window.location.href = "/worker-portfolio?worker_id=" + workerId;
            } else {
                window.history.back();
            }

        });
    }
    /* ================= 2️⃣ CHARACTER COUNTER ================= */

    if (description && charCount) {
        description.addEventListener("input", function () {
            const length = this.value.length;
            charCount.textContent = length;
            charCount.style.color = length > 450 ? "#ef4444" : "#ffffff";
        });
    }


    /* ================= 3️⃣ SUBMIT ENABLE ================= */

    if (agreementCheck && submitBtn) {
        submitBtn.disabled = true;

        agreementCheck.addEventListener("change", function () {
            submitBtn.disabled = !this.checked;
        });
    }


    /* ================= 4️⃣ CUSTOM FIELD TOGGLE ================= */

    function toggleCustomField(selectEl, customEl) {
        selectEl.addEventListener("change", function () {
            if (this.value === "Other") {
                customEl.style.display = "block";
                customEl.setAttribute("required", "true");
            } else {
                customEl.style.display = "none";
                customEl.removeAttribute("required");
                customEl.value = "";
            }
        });
    }

    if (jobTitle && customJobTitle) {
        toggleCustomField(jobTitle, customJobTitle);
    }

    if (timeSlot && customTimeSlot) {
        toggleCustomField(timeSlot, customTimeSlot);
    }


    /* ================= 5️⃣ EDIT LOCATION ================= */

    if (editLocationBtn && locationInput) {
        editLocationBtn.addEventListener("click", function () {
            locationInput.removeAttribute("readonly");
            locationInput.focus();
        });
    }


    /* ================= 6️⃣ DRAG & DROP UPLOAD ================= */

    if (uploadArea && fileInput && photoPreview) {

        let selectedFiles = [];
        const maxPhotos = 5;

        uploadArea.addEventListener("click", () => fileInput.click());

        uploadArea.addEventListener("dragover", (e) => {
            e.preventDefault();
            uploadArea.style.background = "rgba(255,255,255,0.2)";
        });

        uploadArea.addEventListener("dragleave", () => {
            uploadArea.style.background = "rgba(255,255,255,0.08)";
        });

        uploadArea.addEventListener("drop", (e) => {
            e.preventDefault();
            uploadArea.style.background = "rgba(255,255,255,0.08)";
            handleFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener("change", () => {
            handleFiles(fileInput.files);
        });

        function handleFiles(files) {

            const fileArray = Array.from(files);

            fileArray.forEach(file => {

                if (selectedFiles.length >= maxPhotos) {
                    alert("Maximum 5 photos allowed.");
                    return;
                }

                if (!file.type.startsWith("image/")) return;

                selectedFiles.push(file);

                const reader = new FileReader();

                reader.onload = function (e) {

                    const wrapper = document.createElement("div");
                    wrapper.classList.add("preview-wrapper");

                    const img = document.createElement("img");
                    img.src = e.target.result;
                    img.classList.add("preview-image");

                    const removeBtn = document.createElement("button");
                    removeBtn.innerHTML = "✕";
                    removeBtn.classList.add("remove-btn");

                    removeBtn.addEventListener("click", function () {
                        wrapper.remove();
                        selectedFiles = selectedFiles.filter(f => f !== file);
                        photoCount.textContent = selectedFiles.length;
                    });

                    wrapper.appendChild(img);
                    wrapper.appendChild(removeBtn);
                    photoPreview.appendChild(wrapper);

                    photoCount.textContent = selectedFiles.length;
                };

                reader.readAsDataURL(file);
            });
        }
    }


    /* ================= 7️⃣ FORM VALIDATION ================= */

    if (form) {
        form.addEventListener("submit", function (e) {

            let valid = true;
            const requiredFields = form.querySelectorAll("[required]");

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.style.boxShadow = "0 0 0 2px red";
                    valid = false;
                } else {
                    field.style.boxShadow = "";
                }
            });

            if (!agreementCheck.checked) {
                valid = false;
                alert("Please agree before submitting.");
            }

            if (!valid) e.preventDefault();
        });
    }

});

if (workerId) {
    fetch(`/api/worker/${workerId}`)
        .then(res => res.json())
        .then(worker => {
            document.getElementById("workerNameDisplay").innerText = worker.name;
            document.querySelector(".worker-skill").innerText = worker.trade;
            document.querySelector(".worker-mini-img").src =
                worker.photo || "/static/images/default-avatar.png";
        });
}