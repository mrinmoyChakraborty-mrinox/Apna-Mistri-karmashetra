from flask import Flask, render_template, request, redirect, url_for, session, abort, jsonify
from services import firebase_services, imagekit_services
from firebase_admin import auth
import requests
from PIL import Image
import os
app = Flask(__name__)
app.secret_key = "super-secret-key"


# ======================
# Helpers
# ======================

# ======================
# Public Pages
# ======================

@app.route("/")
def landing():
    if session.get("user"):
        return render_template("home.html",user=session.get("user"))
    return render_template("home.html")    
    

@app.route("/search")
def search():
    if not session.get("user"):
        return render_template("search.html")
    
    return render_template("search.html",user=session.get("user"))

@app.route("/api/get_firebase_config", methods=['GET'])
def get_firebase_config():
    firebase_config = {
        "apiKey": os.environ.get("FIREBASE_API_KEY"),
        "authDomain": os.environ.get("FIREBASE_AUTH_DOMAIN"),
        "projectId": os.environ.get("FIREBASE_PROJECT_ID"),
        "storageBucket": os.environ.get("FIREBASE_STORAGE_BUCKET"),
        "messagingSenderId": os.environ.get("FIREBASE_MESSAGING_SENDER_ID"),
        "appId": os.environ.get("FIREBASE_APP_ID"),
        "vapidKey": os.environ.get("FIREBASE_VAPID_KEY")
    }
    return jsonify(firebase_config)
@app.route("/getstarted")
def getstarted():
    next_url = request.args.get("next")
    if next_url:
        session["next"] = next_url
    return render_template("getstarted.html")

@app.route("/firebase-login", methods=["POST"])
def firebase_login():

    id_token = request.json.get("idToken")

    decoded = auth.verify_id_token(id_token)

    uid = decoded["uid"]
    email = decoded.get("email")
    phone = decoded.get("phone_number")
    name = decoded.get("name") or "User"
    photo = decoded.get("picture")

    doc=firebase_services.get_user_by_uid(uid)
    next_url = session.pop("next", None)
    # NEW USER
    if not doc:
        firebase_services.add_user(uid,email,name,photo)

        session["user"]={
            "uid": uid,
            "name": name,
            "photo_url": photo,
            "role": None
        }

        return {"status": "new"}

    # EXISTING USER
    role = doc.get("role")

    session["user"]={
            "uid": uid,
            "name": name,
            "photo_url": photo,
            "role": role
        }


    if next_url:
        return {"status": "existing", "role": role, "redirect": next_url}
    return {"status": "existing", "role": role}


@app.route("/user/setup", methods=["GET", "POST"])
def user_setup():

    if not session["user"]:
        return redirect("/")

    uid = session["user"]["uid"]

    if request.method == "GET":
        return render_template("usersetup.html", user=session["user"])

    # ---------- POST ----------

    name = request.form.get("name")
    phone = request.form.get("phone")
    email = request.form.get("email")
    address = request.form.get("address")
    city = request.form.get("city")
    pincode = request.form.get("pincode")
    addr={
        "fulladdr": address,
        "city": city,
        "pincode": pincode
    }
    photo = request.files.get("photo")

    photo_url = None

    if photo:
        result = imagekit_services.upload_user_profile(uid, photo)
        photo_url = result["url"]
    data={
        "name": name,
        "phone": phone,
        "email": email,
        "address": addr,
        "photo_url": photo_url}
    # Update users collection (customer profile lives here)
    firebase_services.update_user_profile(uid,data)
    session["user"]["role"]="customer"
    session.modified = True
    return {"success": True}


@app.route("/api/update-profile", methods=["POST"])
def update_profile():

    uid = session["user"]["uid"]

    name = request.form.get("name")
    phone = request.form.get("phone")
    email = request.form.get("email")
    address = request.form.get("address")
    city = request.form.get("city")
    pincode = request.form.get("pincode")

    photo = request.files.get("photo")

    photo_url = None
    if photo:
        upload = imagekit_services.upload_user_profile(uid, photo)
        photo_url = upload
    else:
        photo_url = imagekit_services.get_profile_photo_url(uid)
    firebase_services.update_user_profile(uid,{
        "name": name,
        "phone": phone,
        "address": {
            "fulladdr": address,
            "city": city,
            "pincode": pincode
        },
        "photo_url": photo_url,
        "email": email
    })

    if photo_url:
        session["user"]["photo_url"] = photo_url
        session.modified = True

    return {"success": True}

@app.route("/profile")
def profile():
    if not session["user"]:
        return redirect("/")
    role=session["user"]["role"]
    uid=session["user"]["uid"]
    if role=="worker":
        return redirect(f"/worker/{uid}")
    else:
        return redirect("/profile/customer") 

@app.route("/profile/customer")
def customer_profile():
    if not session["user"]:
        return redirect("/")

    uid = session["user"]["uid"]
    user = firebase_services.get_user_by_uid(uid)    
    return render_template("customerprofile.html", user=user)


@app.route("/worker/<uid>")
def worker_portfolio(uid):

    worker = firebase_services.get_worker_profile(uid)

    if not worker:
        abort(404)

    current_uid = session.get("user", {}).get("uid")

    is_owner = current_uid == uid

    return render_template(
        "worker_portfolio.html",
        slug=worker,
        is_owner=is_owner,
        user=session.get("user")
    )

@app.route("/api/check-auth")
def check_auth():
    if session.get("user"):
        return {"authenticated": True,"status": 200, "user": session["user"]}
    return {"authenticated": False, "status": 401}, 401

# ======================
# Role Setup (First Time)
# ======================
@app.route("/select-role", methods=["GET", "POST"])
def select_role():

    # Must be logged in
    if not session["user"]:
        return redirect("/")

    uid = session["user"]["uid"]

    # ------------------
    # GET → Show page
    # ------------------
    if request.method == "GET":

        user_dic = firebase_services.get_user_by_uid(uid)

        # If role already chosen, skip this page
        if user_dic and user_dic.get("role"):
            role = user_dic["role"]

            if role == "worker":
                return redirect("/worker/dashboard")
            else:
                return redirect("/customer/dashboard")

        # Otherwise show role selection
        return render_template("choose_role.html")

    # ------------------
    # POST → Save role
    # ------------------
    role = request.json.get("role")

    if role not in ["customer", "worker"]:
        return {"success": False}, 400

    # Update users collection
    firebase_services.update_role(uid, role)
    # If worker, create worker doc
    if role == "worker":
        firebase_services.create_worker_profile(uid, {
            "name": session["user"]["name"],
            "phone": None,
            "email": None,
            "address": None,
            "skills": []
        })

    session["user"]["role"] = role

    return {"success": True}


# ======================
# Dashboards
# ======================
@app.route("/worker/onboarding", methods=["GET", "POST"])
def worker_onboarding():

    if not  session["user"]:
        return redirect("/")

    uid = session["user"]["uid"]

    if request.method == "GET":
        return render_template("worker_onboarding.html")

    # -------- POST --------

    name = request.form.get("name")
    trade = request.form.get("trade")
    trade_other = request.form.get("trade_other")

    if trade == "Other" and trade_other:
        trade = trade_other

    experience = request.form.get("experience")
    experience_other = request.form.get("experience_other")

    if experience == "Other" and experience_other:
        experience = experience_other

    city = request.form.get("city")
    skills = request.form.getlist("skills")
    radius = request.form.get("radius")
    bio = request.form.get("bio")
    price = request.form.get("price")
    availability = request.form.get("available_days")
    emergency = request.form.get("emergency")
    working_hours = request.form.get("working_hours")

    photo = request.files.get("photo")

    avatar_url = None

    if photo:
        result = imagekit_services.upload_worker_avatar(uid, photo)
        avatar_url = result if result else None

    # Update USERS (identity)
    firebase_services.update_worker_At_user(uid, name, avatar_url)

    # Create / update WORKERS (professional profile)
    firebase_services.update_worker_profile(uid, {
        "name": name,
        "trade": trade,
        "experience": experience,
        "city": city,
        "skills": skills,
        "radius": radius,
        "bio": bio,
        "price": price,
        "availability": availability,
        "working_hours": working_hours,
        "emergency": emergency,
        "avatar_url": avatar_url
    })
    session["user"]["role"] = "worker"
    session["user"]["photo_url"] = avatar_url
    session.modified = True

    return redirect("/worker/dashboard")

@app.route("/dashboard")
def dashboard():
    if not session["user"]:
        return redirect("/")

    if session["user"]["role"] == "worker":
        return redirect("/worker/dashboard")
    elif session["user"]["role"] == "customer":
        return redirect("/customer/dashboard")
    else:
        return redirect("/select-role")    

# ================= WORKER DASHBOARD PAGE =================

@app.route("/worker/dashboard")
def worker_dashboard():
    if not session.get("user") or session["user"]["role"] != "worker":
        return redirect("/getstarted")

    return render_template(
        "worker_dashboard.html",
        user=session["user"]
    )
@app.route("/api/worker/dashboard")
def api_worker_dashboard():

    uid = session["user"]["uid"]

    data = firebase_services.get_worker_dashboard(uid)

    return data  

@app.route("/api/worker/status", methods=["POST"])
def update_worker_status():

    uid = session["user"]["uid"]
    online = request.json.get("online")

    firebase_services.update_worker_online(uid, online)

    return {"success": True}

@app.route("/api/worker/chats")
def worker_recent_chats():

    uid = session["user"]["uid"]

    return firebase_services.get_worker_recent_chats(uid)

@app.route("/api/worker/requests")
def worker_requests():

    uid = session["user"]["uid"]

    return firebase_services.get_worker_requests(uid)

@app.route("/api/worker/job/<job_id>/<action>", methods=["POST"])
def worker_job_action(job_id, action):

    uid = session["user"]["uid"]
    try:

        firebase_services.worker_job_action(uid, job_id, action)

    except Exception as e:
        print("Error in worker_job_action:", e)
        return {"error": str(e)}, 500

    return {"success": True} , 200   


@app.route("/api/worker/<uid>")
def api_worker(uid):
    worker = firebase_services.get_worker_by_uid(uid)
    return jsonify(worker)   

@app.route("/customer/dashboard")
def customer_dashboard():
    return render_template("customer_dashboard.html",user=session["user"])

@app.route("/api/customer/dashboard",methods=["GET"])
def customer_dashboard_data():

    if not session["user"]:
        return {"error": "unauthorized"}, 401

    uid = session["user"]["uid"]

    # --- Ongoing Jobs ---
    ongoing = firebase_services.get_ongoing_jobs_for_user(uid, "customer")
    # --- Previous Jobs ---
    previous = firebase_services.get_previous_jobs_for_user(uid, "customer")
    # --- Saved Workers ---
    saved_workers = firebase_services.get_saved_workers_for_customer(uid)

    # --- Chats ---
    chats = firebase_services.get_chats_for_user(uid)

    return {
        "ongoing_jobs": ongoing,
        "previous_jobs": previous,
        "saved_workers": saved_workers,
        "recent_chats": chats
    }

@app.route("/chat/start", methods=["POST"])
def start_chat():

    if not session["user"]:
        return {"error": "unauthorized"}, 401

    uid = session["user"]["uid"]
    worker_id = request.json.get("workerId")

    # Check existing conversation
    existing = firebase_services.get_existing_conversation(uid, worker_id)
    if existing:
        return existing
    # Create new conversation
    convo = firebase_services.create_new_conversation(uid, worker_id)
    if convo:
        return convo



@app.route("/api/conversations")
def get_conversations():

    if  not session["user"]:
        return [], 401

    uid = session["user"]["uid"]
    chats = firebase_services.get_conversations_for_user(uid)
    return chats


@app.route("/api/messages/<cid>")
def get_messages(cid):

    if  not  session["user"]:
        return [], 401

    msgs= firebase_services.get_messages_from_cid(cid)
    return msgs

@app.route("/api/send/<cid>", methods=["POST"])
def send_message(cid):

    if not session["user"]:
        return {"error": "unauthorized"}, 401

    uid = session["user"]["uid"]
    text = request.json.get("text")

    if not text:
        return {"error": "empty"}, 400

    
    try:
        firebase_services.send_message(cid, uid, text)
    except Exception as e:
        print("Error sending message:", e)
        return {"error": "Failed to send message"}, 500

    

    return {"success": True}


@app.route("/inbox")
def inbox():

    if not session["user"]:
        return redirect("/")

    return render_template("inbox.html", user=session["user"])


@app.route("/about")
def about():
    return render_template("about.html",user=session.get("user"))

@app.route("/how-it-works")
def how_it_works():
    return render_template("how_it_works.html",user=session.get("user"))

@app.route("/create-job", methods=["GET", "POST"])
def create_job():

    # Must be logged in
    user = session.get("user")
    if not user:
        return redirect("/getstarted")

    # ----------------------------
    # GET → Show Create Job Page
    # ----------------------------
    if request.method == "GET":
        worker_id = request.args.get("worker_id")
        return render_template(
            "create_job.html",
            worker_id=worker_id,
            user=user
        )

    # ----------------------------
    # POST → Save Job
    # ----------------------------
    job = {
        "customerId": user["uid"],
        "workerId": request.form.get("worker_id"),
        "jobTitle": request.form.get("job_title"),
        "description": request.form.get("description"),
        "preferredDate": request.form.get("preferred_date"),
        "preferredTime": request.form.get("preferred_time"),
        "location": request.form.get("location"),
        "budget": request.form.get("budget"),
        "notes": request.form.get("notes"),

    }

    firebase_services.create_job(job)

    return redirect("/customer/dashboard")

@app.route("/api/discover-workers", methods=["POST"])
def api_discover_workers():

    data = request.json

    try:
        lat = float(data["lat"])
        lng = float(data["lng"])
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid coordinates"}), 400

    trade = data.get("trade")
    radius = int(data.get("radius", 10))

    # ==========================================
    # REVERSE GEOCODE USING NOMINATIM
    # ==========================================

    try:
        url = "https://nominatim.openstreetmap.org/reverse"

        params = {
            "lat": lat,
            "lon": lng,
            "format": "json",
            "addressdetails": 1
        }

        headers = {
            "User-Agent": "ApnaMistri/1.0"
        }

        response = requests.get(url, params=params, headers=headers, timeout=5)

        if response.status_code != 200:
            return jsonify({"error": "Geocoding failed"}), 500

        location_data = response.json()
        address = location_data.get("address", {})

        # Nominatim city fallback logic
        city = address.get("city")
        print("Detected city:", city)
        if not city:
            return jsonify({"error": "City not found"}), 400

    except Exception as e:
        print("Reverse geocode error:", e)
        return jsonify({"error": "Location detection failed"}), 500

    # ==========================================
    # DISCOVER WORKERS
    # ==========================================

    workers = firebase_services.discover_workers(
        city=city,
        user_lat=lat,
        user_lng=lng,
        trade=trade,
        max_distance=radius
    )

    return jsonify(workers), 200

@app.route("/worker/update-profile", methods=["POST"])
def update_worker_profile_inline():

    if not session.get("user") or session["user"]["role"] != "worker":
        return {"success": False}, 401

    uid = session["user"]["uid"]
    data = request.get_json()
    field = data.get("field")

    if field == "bio":
        firebase_services.update_worker_bio(uid, data.get("value"))

    elif field == "name":
        firebase_services.update_worker_name(uid, data.get("value"))

    elif field == "skills":
        firebase_services.update_worker_skills(uid, data.get("value"))

    elif field == "availability":
        firebase_services.update_worker_availability(
            uid,
            data.get("availability"),
            data.get("working_hours")
        )

    return {"success": True}
@app.route("/job/work-update/<job_id>")
def work_update_page(job_id):

    if not user.get("user"):
        return redirect("/getstarted")

    uid = session["user"]["uid"]
    role = session["user"]["role"]

    job = firebase_services.get_job_by_id(job_id)
    return render_template(
        "Workupdate.html",
        job=job,
        role=role
    )

@app.route("/api/worker/update-location", methods=["POST"])
def update_worker_location():

    if not session.get("user") or session["user"]["role"] != "worker":
        return {"error": "Unauthorized"}, 401

    if session["user"]["role"] != "worker":
        return {"error": "Forbidden"}, 403

    uid = session["user"]["uid"]
    data = request.json

    try:
        lat = float(data["lat"])
        lng = float(data["lng"])
    except:
        return {"error": "Invalid coordinates"}, 400

    firebase_services.update_worker_location(uid, lat, lng)

    return {"success": True}, 200
# ======================
# Logout
# ======================

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")

# ======================
# Error
# ======================

@app.errorhandler(403)
def forbidden(e):
    return "Forbidden", 403

# ======================
# Run
# ======================

if __name__ == "__main__":
    app.run(debug=True)
