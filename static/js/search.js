let map;
let modalMap;
let selectedLat = null;
let selectedLng = null;
let userMarker = null;
let workerMarkers = [];

document.addEventListener("DOMContentLoaded", () => {
    initMainMap();
    initModalLogic();
    attachSearchEvents();
});

/* ================= MAIN MAP ================= */

function initMainMap() {

    map = L.map("gpsBox").setView([22.5726, 88.3639], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
    }).addTo(map);
}

function placeUserMarker(lat, lng) {

    if (userMarker) map.removeLayer(userMarker);

    userMarker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup("Your Location")
        .openPopup();
}

/* ================= MODAL MAP ================= */

function initModalLogic() {

    const modal = document.getElementById("mapModal");
    const pickBtn = document.getElementById("pickLocationBtn");
    const closeBtn = document.getElementById("closeMap");
    const confirmBtn = document.getElementById("confirmLocation");
    const locationText = document.getElementById("selectedLocationText");

    pickBtn.addEventListener("click", () => {
        modal.style.display = "flex";

        setTimeout(() => {

            if (!modalMap) {

                modalMap = L.map("locationMap")
                    .setView([22.5726, 88.3639], 13);

                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    maxZoom: 19
                }).addTo(modalMap);

                modalMap.on("click", e => {

                    selectedLat = e.latlng.lat;
                    selectedLng = e.latlng.lng;

                    L.marker([selectedLat, selectedLng])
                        .addTo(modalMap)
                        .bindPopup("Selected")
                        .openPopup();
                });
            }

            modalMap.invalidateSize();

        }, 200);
    });

    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    confirmBtn.addEventListener("click", () => {

        if (!selectedLat) {
            alert("Please select location.");
            return;
        }

        placeUserMarker(selectedLat, selectedLng);
        locationText.innerText =
            `Selected: ${selectedLat.toFixed(4)}, ${selectedLng.toFixed(4)}`;

        modal.style.display = "none";
    });
}

/* ================= SEARCH ================= */

function attachSearchEvents() {
    document
        .getElementById("searchBtn")
        .addEventListener("click", discoverWorkers);
}

async function discoverWorkers() {

    if (!selectedLat) {
        alert("Pick your location first.");
        return;
    }

    const trade =
        document.getElementById("tradeInput").value;

    const radius =
        document.getElementById("radiusSelect").value;

    const verified =
        document.getElementById("verifiedOnly").checked;

    const res = await fetch("/api/discover-workers", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            lat: selectedLat,
            lng: selectedLng,
            trade: trade,
            radius: radius,
            verified: verified
        })
    });

    const workers = await res.json();
    renderWorkers(workers);
}

/* ================= RENDER WORKERS ================= */

function renderWorkers(workers) {

    clearWorkerMarkers();

    if (!workers.length) {
        alert("No workers found.");
        return;
    }

    workers.forEach(worker => {

        const marker =
            L.marker([worker.lat, worker.lng]).addTo(map);

        marker.bindPopup(`
            <strong>${worker.name}</strong><br>
            ${worker.trade}<br>
            ${worker.distance} km away<br>
            <button onclick="openProfile('${worker.uid}')">
                View Profile
            </button>
        `);

        workerMarkers.push(marker);
    });
}

function clearWorkerMarkers() {
    workerMarkers.forEach(m => map.removeLayer(m));
    workerMarkers = [];
}

function openProfile(uid) {
    window.location.href = "/worker/" + uid;
}