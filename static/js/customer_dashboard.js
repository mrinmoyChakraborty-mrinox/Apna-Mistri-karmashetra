document.addEventListener("DOMContentLoaded", async ()=>{

 const res = await fetch("/api/customer/dashboard");
 const data = await res.json();

 renderSection("ongoingJobs", data.ongoing_jobs, "No ongoing jobs");
 renderSection("previousHires", data.previous_jobs, "No previous hires");
 renderSection("recentChats", data.recent_chats, "No chats yet");
 renderSection("savedWorkers", data.saved_workers, "No saved workers");

});

function closeModal(){
  document.getElementById("modalOverlay").style.display="none";
}

function openModal(title, items, renderFn){

  document.getElementById("modalTitle").innerText = title;

  const container = document.getElementById("modalContent");
  container.innerHTML = "";

  items.forEach(item=>{
    container.innerHTML += renderFn(item);
  });

  document.getElementById("modalOverlay").style.display="block";
}
function accordion(title, body){

  return `
  <details style="margin-bottom:10px;">
    <summary style="cursor:pointer;">${title}</summary>
    <div style="padding:10px;color:#ccc;">
      ${body}
    </div>
  </details>
  `;
}

function renderSection(id, items, emptyText){

  const container = document.getElementById(id);
  container.innerHTML = "";

  if(items.length === 0){
      container.innerHTML = `<p>${emptyText}</p>`;
      return;
  }

  const preview = items.slice(0, 2);

  preview.forEach(job => {

      container.innerHTML += `
      <div class="worker-row">

          <img src="/static/images/avatar_illustrated.jpeg"
               class="avatar"
               alt="Worker Avatar">

          <div class="info">
              <p><strong>${job.workerName || "Worker"}</strong></p>
              <p>${job.description || "Job"}</p>
              <p>Status: ${job.status}</p>
              <p>Created: ${formatDate(job.createdAt)}</p>
          </div>

          <div class="right-actions">
              <button class="primary-btn" onclick='openJobDetails(${JSON.stringify(job)})'>
                                View Details
              </button>

          </div>

      </div>
      `;
  });

  if(items.length > 2){
      container.innerHTML += `
        <span class="see-more" onclick='showAll("${id}")'>
          See more
        </span>
      `;
  }

  window[id+"Data"] = items;
}

window.showAll = function(type){

  const datasets = {
    ongoingJobs: window.ongoingJobsData,
    previousHires: window.previousHiresData,
    savedWorkers: window.savedWorkersData,
    recentChats: window.recentChatsData
  };

  const titles = {
    ongoingJobs: "Ongoing Jobs",
    previousHires: "Previous Hires",
    savedWorkers: "Saved Workers",
    recentChats: "Recent Chats"
  };

  const data = datasets[type];

  if(!data || data.length === 0){
    alert("Nothing to show");
    return;
  }

  openModal(
    titles[type],
    data,
    item => accordion(
      item.workerName || item.name || "Item",
      `
        <p><b>Job:</b> ${item.description || "-"}</p>
        <p><b>Status:</b> ${item.status || "-"}</p>
        <p><b>Date:</b> ${formatDate(item.createdAt)}</p>
      `
    )
  );
};



function formatDate(timestamp){

    if(!timestamp) return "-";

    if(timestamp.seconds){
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString();
    }

    return timestamp;
}

function openJobDetails(job){

  openModal(
    "Job Details",

    [job],

    j => `
      <div style="padding:10px">

        <h3>${j.workerName}</h3>

        <p><strong>Job:</strong> ${j.description}</p>
        <p><strong>Status:</strong> ${j.status}</p>
        <p><strong>Created:</strong> ${formatDate(j.createdAt)}</p>

        ${j.rating ? `<p><strong>Rating:</strong> ${j.rating} ⭐</p>` : ""}
        ${j.review ? `<p><strong>Review:</strong> ${j.review}</p>` : ""}

      </div>
    `
  );

}
function openInbox(){
  window.location.href = "/inbox";
}
