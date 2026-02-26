document.addEventListener("DOMContentLoaded", function () {

    const uploadArea = document.getElementById("uploadArea");
    const fileInput = document.getElementById("beforeImages");
    const preview = document.getElementById("imagePreview");
    
    if (uploadArea && fileInput) {

        uploadArea.addEventListener("click", () => fileInput.click());

        fileInput.addEventListener("change", function () {

            preview.innerHTML = "";

            const files = Array.from(this.files).slice(0,5);

            files.forEach(file => {

                if (!file.type.startsWith("image/")) return;

                const reader = new FileReader();

                reader.onload = function (e) {
                    const img = document.createElement("img");
                    img.src = e.target.result;
                    preview.appendChild(img);
                };

                reader.readAsDataURL(file);

            });

        });
    }

});