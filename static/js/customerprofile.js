const inputs = document.querySelectorAll("input, textarea");
const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");

const photoInput = document.getElementById("photoInput");
const changePhotoBtn = document.getElementById("changePhotoBtn");
const preview = document.getElementById("profilePreview");

let selectedPhoto = null;

// View mode
inputs.forEach(i => i.disabled = true);

// Enable edit
editBtn.addEventListener("click", () => {
  inputs.forEach(i => i.disabled = false);
  editBtn.style.display = "none";
  saveBtn.style.display = "block";
  changePhotoBtn.style.display = "block";
});

// Click change photo
changePhotoBtn.addEventListener("click", () => {
  photoInput.click();
});

// Preview image
photoInput.addEventListener("change", e => {
  selectedPhoto = e.target.files[0];
  preview.src = URL.createObjectURL(selectedPhoto);
});

// Save
saveBtn.addEventListener("click", async () => {

  const formData = new FormData();

  formData.append("name", document.getElementById("name").value);
  formData.append("phone", document.getElementById("phone").value);
  formData.append("email", document.getElementById("email").value);
  formData.append("address", document.getElementById("address").value);
  formData.append("city", document.getElementById("city").value);
  formData.append("pincode", document.getElementById("pincode").value);

  if (selectedPhoto) {
    formData.append("photo", selectedPhoto);
  }

  const res = await fetch("/api/update-profile", {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  if (data.success) {
    alert("Profile Updated");
    location.reload();
  }
});
