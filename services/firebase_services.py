import firebase_admin
import math
from firebase_admin import credentials, firestore, auth, storage
import os,json
from flask import jsonify
from datetime import datetime, timedelta
import pytz
firebase_creds = os.environ.get("FIREBASE_CONFIG")

if firebase_creds:
    cred_dict = json.loads(firebase_creds)
    cred = credentials.Certificate(cred_dict)
else:
    # fallback for local dev
    raise Exception("FIREBASE_SERVICE_ACCOUNT environment variable not set")

# ======================
# Firebase Init
# ======================

# Avoid 'app already exists' error if this file is imported more than once
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()


# --- User Functions ---
def add_user(uid,email,name,photo_url):
    user_ref = db.collection("users").document(uid)
    user_ref.set({
        "uid": uid,
        "name": name,
        "email": email,
        "createdAt": firestore.SERVER_TIMESTAMP,
        "photo_url":photo_url,
        "role":None,
        "phone":None
    })

def add_user_phone(uid, phone, name, photo_url):
    db.collection("users").document(uid).set({
        "uid": uid,
        "phone": phone,
        "name": name,
        "photo_url": photo_url,
        "role": None,
        "createdAt": firestore.SERVER_TIMESTAMP
    })
def get_user_by_uid(uid):
    doc = db.collection("users").document(uid).get()
    return doc.to_dict() if doc.exists else None

def update_role(uid, role):
    db.collection("users").document(uid).update({
        "role": role,
        "updatedAt": firestore.SERVER_TIMESTAMP
    })
def update_user_profile(uid,data):
    
    db.collection("users").document(uid).update({
        "name": data["name"],
        "phone": data["phone"],
        "email": data["email"],
        "address": data["address"],
        "photo_url": data["photo_url"],
        "updatedAt": firestore.SERVER_TIMESTAMP
    })
def create_worker_profile(uid,data):
    db.collection("workers").document(uid).set({
        "name": data["name"],
        "phone": data["phone"],
        "email": data["email"],
        "address": data["address"],
        "skills": data["skills"],
        "updatedAt": firestore.SERVER_TIMESTAMP
    })


# ======================
# ongoing jobs
# ======================
def get_ongoing_jobs_for_user(uid, role):
    if role == "customer":
        jobs_ref = db.collection("jobs").where("customerId", "==", uid).where("status", "in", ["accepted", "in_progress"])
        jobs=[]
        for doc in jobs_ref.stream():
            wid=doc.to_dict().get("workerId")
            workern=db.collection("workers").document(wid).get().to_dict().get("name")
            job = doc.to_dict()
            job["workerName"] = workern
            jobs.append(job)
    else:
        jobs_ref = db.collection("jobs").where("workerId", "==", uid).where("status", "in", ["accepted", "in_progress"])

    return jobs

# ======================
# previous jobs
# ======================
def get_previous_jobs_for_user(uid, role):
    if role == "customer":
        jobs_ref = db.collection("jobs").where("customerId", "==", uid).where("status", "==", "completed")
        jobs=[]
        for doc in jobs_ref.stream():
            wid=doc.to_dict().get("workerId")
            workern=db.collection("workers").document(wid).get().to_dict().get("name")
            job = doc.to_dict()
            job["workerName"] = workern
            jobs.append(job)
    else:
        jobs_ref = db.collection("jobs").where("workerId", "==", uid).where("status", "==", "completed")

    return jobs  

def save_worker_for_customer(customer_uid, worker_uid):
    customer_ref = db.collection("users").document(customer_uid)
    customer_ref.update({
        "saved_workers": firestore.ArrayUnion([worker_uid]),
        "updatedAt": firestore.SERVER_TIMESTAMP
    })
def remove_saved_worker_for_customer(customer_uid, worker_uid):
    customer_ref = db.collection("users").document(customer_uid)
    customer_ref.update({
        "saved_workers": firestore.ArrayRemove([worker_uid]),
        "updatedAt": firestore.SERVER_TIMESTAMP
    })
def get_saved_workers_for_customer(customer_uid):
    customer_doc = db.collection("users").document(customer_uid).get()
    if customer_doc.exists:
        saved_ids = customer_doc.to_dict().get("saved_workers", [])
        saved_workers = []
        for wid in saved_ids:
            w = db.collection("workers").document(wid).get()
            if w.exists:
                saved_workers.append(w.to_dict())
        return saved_workers
    return []
def get_chats_for_user(uid):
    chats = []
    chat_Ref = db.collection("conversations").where("customerId", "==", uid).limit(5)
    for doc in chat_Ref.stream():
        chats.append(doc.to_dict())
    return chats
def get_chats_for_worker(uid):
    chats = []
    chat_Ref = db.collection("conversations").where("workerId", "==", uid).limit(5)
    for doc in chat_Ref.stream():
        chats.append(doc.to_dict())
    return chats                     
def update_worker_profile(uid,data):
    db.collection("workers").document(uid).set({

        "uid": uid,
        "name": data["name"],
        "trade": data["trade"],
        "experience": data["experience"],
        "city": data["city"],
        "skills": data["skills"],
        "radius": data["radius"],
        "bio": data["bio"],
        "price": data["price"],
        "availability": data["availability"],
        "working_hours": data["working_hours"],
        "emergency": data["emergency"],


        "avatar_url": data["avatar_url"],

        "rating": 0,
        "totalJobs": 0,
        "verified": False,

        "createdAt": firestore.SERVER_TIMESTAMP

    }, merge=True)
def update_worker_At_user(uid,name,photo_url):
    db.collection("users").document(uid).update({
        "name": name,
        "photo_url": photo_url,
        "updatedAt": firestore.SERVER_TIMESTAMP
    })


def get_existing_conversation(customer_id, worker_id):
    existing = db.collection("conversations")\
        .where("participants", "array_contains", customer_id)\
        .stream()

    for c in existing:
        if worker_id in c.to_dict()["participants"]:
            return {"conversationId": c.id}
def create_new_conversation(customer_id, worker_id):
    ref = db.collection("conversations").add({
        "participants": [customer_id, worker_id],
        "lastMessage": "",
        "updatedAt": firestore.SERVER_TIMESTAMP,
        "customerId": customer_id,
        "workerId": worker_id
    })
    return {"conversationId":ref[1].id}     


def get_conversations_for_user(uid):

    chats = []

    docs = db.collection("conversations")\
        .where("participants", "array_contains", uid)\
        .order_by("updatedAt", direction=firestore.Query.DESCENDING)\
        .stream()

    for c in docs:
        d = c.to_dict()
        d["id"] = c.id

        # Find the other participant
        other_uid = [p for p in d["participants"] if p != uid][0]

        # First try workers collection
        other_doc = db.collection("workers").document(other_uid).get()

        if other_doc.exists:
            other = other_doc.to_dict()

        else:
            # Fallback to users (customer)
            other_doc = db.collection("users").document(other_uid).get()
            other = other_doc.to_dict() if other_doc.exists else {}

        chats.append({
            "id": c.id,
            "name": other.get("name", "Unknown"),
            "photo": other.get("photo_url"),
            "lastMessage": d.get("lastMessage"),
            "updatedAt": d.get("updatedAt")
        })

    return chats
def get_messages_from_cid(conversation_id):
    msgs = []

    for m in db.collection("conversations")\
        .document(conversation_id)\
        .collection("messages")\
        .order_by("createdAt")\
        .stream():
        d=m.to_dict()
         # convert Firestore timestamp → seconds
        if "createdAt" in d:
            d["createdAt"] = d["createdAt"].timestamp()


        msgs.append(d)
    return msgs

def send_message(conversation_id, sender_id, text):
    # Save message
    db.collection("conversations")\
        .document(conversation_id)\
        .collection("messages")\
        .add({
            "senderId": sender_id,
            "text": text,
            "createdAt": firestore.SERVER_TIMESTAMP
        })
    db.collection("conversations")\
        .document(conversation_id)\
        .update({
            "lastMessage": text,
            "updatedAt": firestore.SERVER_TIMESTAMP
        })  


def get_profile_photo_url(uid):
    user_doc = db.collection("users").document(uid).get()
    if user_doc.exists:
        return user_doc.to_dict().get("photo_url")
    return None

def get_worker_profile(uid):

    user_doc = db.collection("users").document(uid).get()
    worker_doc = db.collection("workers").document(uid).get()

    if not user_doc.exists or not worker_doc.exists:
        return None

    user = user_doc.to_dict()
    worker = worker_doc.to_dict()

    return {
        "uid": uid,
        "name": user.get("name"),
        "photo": user.get("photo_url"),

        "trade": worker.get("trade"),
        "experience": worker.get("experience"),
        "location": worker.get("city"),

        "rating": worker.get("rating", 0),
        "review_count": worker.get("totalJobs", 0),

        "about": worker.get("bio", ""),
        "skills": worker.get("skills", []),
        "availability": worker.get("availability", ""),
        "working_hours": worker.get("working_hours", ""),
        "price": worker.get("price", 0),

        "work_gallery": worker.get("work_gallery", []),
        "reviews": worker.get("reviews", [])
    }

def get_worker_dashboard(uid):

    worker_ref = db.collection("workers").document(uid)
    worker_doc = worker_ref.get()

    if not worker_doc.exists:
        return {}

    worker = worker_doc.to_dict()

    # ================= ongoing JOBS =================
    ongoing_jobs_query = (
        db.collection("jobs")
        .where("workerId", "==", uid)
        .where("status", "in", ["accepted", "in_progress"])
        .stream()
    )

    ongoing_jobs = []
    for doc in ongoing_jobs_query:
        job = doc.to_dict()
        job["id"] = doc.id
        ongoing_jobs.append(job)

    # ================= INCOMING JOBS =================
    incoming_query = (
        db.collection("jobs")
        .where("workerId", "==", uid)
        .where("status", "==", "pending")
        .stream()
    )

    incoming_jobs = []
    for doc in incoming_query:
        job = doc.to_dict()
        job["customerName"] = db.collection("users").document(job["customerId"]).get().to_dict().get("name", "Customer")
        job["id"] = doc.id
        incoming_jobs.append(job)

    # ================= JOB HISTORY =================
    history_query = (
        db.collection("jobs")
        .where("workerId", "==", uid)
        .where("status", "in", ["completed", "cancelled"])
        .stream()
    )

    history = []
    for doc in history_query:
        job = doc.to_dict()
        job["id"] = doc.id
        history.append(job)

    # ================= RECENT CHATS =================
    chat_query = (
        db.collection("conversations")
        .where("participants", "array_contains", uid)
        .order_by("updatedAt", direction=firestore.Query.DESCENDING)
        .limit(5)
        .stream()
    )

    recent_chats = []

    for chat_doc in chat_query:
        chat = chat_doc.to_dict()
        chat_id = chat_doc.id

        # Identify customer (other participant)
        participants = chat.get("participants", [])
        other_user = [p for p in participants if p != uid]

        customer_name = "Customer"
        customer_photo = ""

        if other_user:
            customer_doc = db.collection("customers").document(other_user[0]).get()
            if customer_doc.exists:
                customer_data = customer_doc.to_dict()
                customer_name = customer_data.get("name", "Customer")
                customer_photo = customer_data.get("photo_url", "")

        recent_chats.append({
            "chatId": chat_id,
            "customer_name": customer_name,
            "customer_photo": customer_photo,
            "last_message": chat.get("lastMessage", ""),
            "last_message_time": chat.get("updatedAt")
        })

    return {
        "name": worker.get("name"),
        "rating": worker.get("rating", 0),
        "ongoing_jobs": ongoing_jobs,
        "incoming_jobs": incoming_jobs,
        "job_history": history,
        "recent_chats": recent_chats,
        "active_jobs_count": len(ongoing_jobs)
    }
def update_worker_online(uid, online):

    db.collection("workers").document(uid).update({
        "online": online
    })

def get_worker_recent_chats(uid):

    chats = []

    for c in db.collection("conversations")\
        .where("participants", "array_contains", uid)\
        .order_by("updatedAt", direction=firestore.Query.DESCENDING)\
        .limit(5)\
        .stream():

        d = c.to_dict()
        d["id"] = c.id

        customer_id = [p for p in d["participants"] if p != uid][0]

        customer = db.collection("users").document(customer_id).get().to_dict()

        chats.append({
            "conversationId": c.id,
            "customerName": customer.get("name"),
            "lastMessage": d.get("lastMessage"),
            "time": d.get("updatedAt")
        })

    return chats
def get_worker_requests(uid):

    jobs = []

    for j in db.collection("jobs")\
        .where("workerId", "==", uid)\
        .where("status", "==", "pending")\
        .stream():

        d = j.to_dict()
        d["id"] = j.id
        jobs.append(d)

    return jobs


def worker_job_action(uid, job_id, action):

    status = "accepted" if action == "accept" else "declined"

    db.collection("jobs").document(job_id).update({
        "status": status,
        "updatedAt": firestore.SERVER_TIMESTAMP
    })


def get_worker_by_uid(uid):
    doc = db.collection("workers").document(uid).get()

    if not doc.exists:
        return {}

    data = doc.to_dict()
    return {
        "uid": uid,
        "name": data.get("name"),
        "trade": data.get("trade"),
        "photo": data.get("avatar_url")
    }


def create_job(job):
    job = {
        "customerId": job.get("customerId"),
        "workerId": job.get("workerId"),
        "jobTitle": job.get("jobTitle"),
        "description": job.get("description"),
        "preferredDate": job.get("preferredDate"),
        "preferredTime": job.get("preferredTime"),
        "location": job.get("location"),
        "budget": job.get("budget"),
        "notes": job.get("notes"),
        "status": "pending",
        "createdAt": firestore.SERVER_TIMESTAMP
    }
    db.collection("jobs").add(job)    


# ================= INLINE UPDATE FUNCTIONS =================

def update_worker_bio(uid, bio):
    db.collection("workers").document(uid).update({
        "bio": bio,
        "updatedAt": firestore.SERVER_TIMESTAMP
    })


def update_worker_name(uid, name):
    db.collection("workers").document(uid).update({
        "name": name,
        "updatedAt": firestore.SERVER_TIMESTAMP
    })

    # Also update in users collection
    db.collection("users").document(uid).update({
        "name": name
    })


def update_worker_skills(uid, skills):
    db.collection("workers").document(uid).update({
        "skills": skills,
        "updatedAt": firestore.SERVER_TIMESTAMP
    })


def update_worker_availability(uid, availability, working_hours):
    db.collection("workers").document(uid).update({
        "availability": availability,
        "working_hours": working_hours,
        "updatedAt": firestore.SERVER_TIMESTAMP
    })
def update_worker_avatar(uid, avatar_url):
    db.collection("workers").document(uid).update({
        "avatar_url": avatar_url,
        "updatedAt": firestore.SERVER_TIMESTAMP
    })

    db.collection("users").document(uid).update({
        "photo_url": avatar_url
    })


def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)

    a = (math.sin(dLat/2) ** 2 +
         math.cos(math.radians(lat1)) *
         math.cos(math.radians(lat2)) *
         math.sin(dLon/2) ** 2)

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c


def discover_workers(city, user_lat, user_lng, trade=None, max_distance=None, verified=None):

    query = db.collection("workers")

    if trade:
        query = query.where("trade", "==", trade.lower())

    if verified is not None:
        query = query.where("verified", "==", verified)

    docs = query.stream()

    workers = []

    for doc in docs:
        w = doc.to_dict()

        if not w.get("location"):
            continue

        w_lat = w["location"]["lat"]
        w_lng = w["location"]["lng"]
        print(f"Worker {w.get('name')} is at ({w_lat}, {w_lng})")
        distance = haversine(user_lat, user_lng, w_lat, w_lng)

        if max_distance and distance > max_distance:
            continue

        workers.append({
            "uid": doc.id,
            "name": w.get("name"),
            "trade": w.get("trade"),
            "distance": round(distance, 2),
            "lat": w_lat,
            "lng": w_lng,
            "photo": w.get("avatar_url"),
            "rating": w.get("rating", 0),
            "verified": w.get("verified", False),
            "price": w.get("price", 0)
        })

    return workers

def update_worker_location(uid, lat, lng):

    db.collection("workers").document(uid).update({
        "location": {
            "lat": lat,
            "lng": lng
        },
        "updatedAt": firestore.SERVER_TIMESTAMP
    })
def get_job_by_id(job_id):
    job_doc = db.collection("jobs").document(job_id).get()

    if not job_doc.exists:
        return "Job not found", 404

    job = job_doc.to_dict()
    job["id"] = job_id
    return job
