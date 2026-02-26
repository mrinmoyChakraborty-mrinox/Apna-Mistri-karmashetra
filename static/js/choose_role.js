document.querySelectorAll(".role-card").forEach(card => {

  card.addEventListener("click", async () => {

    const role = card.classList.contains("worker") ? "worker" : "customer";

    const res = await fetch("/select-role", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ role })
    });

    const data = await res.json();

    if (data.success) {

      if (role === "worker") {
        window.location.href = "/worker/onboarding";
      } else {
        window.location.href = "/user/setup";
      }

    } else {
      alert("Failed to set role");
    }

  });

});
