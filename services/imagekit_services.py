from imagekitio import ImageKit
import os
import io
import base64
from PIL import Image

imagekit = ImageKit(
    private_key=os.environ.get("IMAGEKIT_PRIVATE_KEY"),
    #public_key=os.environ.get("IMAGEKIT_PUBLIC_KEY"),
    url_endpoint=os.environ.get("IMAGEKIT_URL_ENDPOINT")
)

# -------------------------
# Helper: upload PIL image
# -------------------------

def upload_pil_image(pil_image, file_name, folder_path):

    try:
        img_byte_arr = io.BytesIO()
        pil_image.save(img_byte_arr, format="JPEG", quality=90)
        img_byte_arr.seek(0)

        encoded_string = base64.b64encode(img_byte_arr.read()).decode("utf-8")

        options = UploadFileRequestOptions(
            folder=folder_path
        )

        upload = imagekit.upload_file(
            file=encoded_string,
            file_name=file_name,
            options=options
        )

        if isinstance(upload, dict):
            return {
                "url": upload.get("url"),
                "fileId": upload.get("file_id")
            }

        return {
            "url": upload.url,
            "fileId": upload.file_id
        }

    except Exception as e:
        print("❌ Image upload failed:", e)
        return None

# -------------------------
# Worker profile avatar
# -------------------------

def upload_worker_avatar(worker_uid, file):

    folder = f"Home/ApnaMistri/workers/{worker_uid}/profile"

    file_to_up=file.read()
    filename = f"profile_{worker_uid}.jpg"
    upload= imagekit.files.upload(
        file=file_to_up,
        file_name=filename,
        folder=folder
    )
    print("✅ Upload successful:", upload)
    return upload.url


# -------------------------
# Job images (before/after)
# -------------------------

def upload_job_image(worker_uid, job_id, pil_image, stage="before"):

    """
    stage = before | after
    """

    folder = f"Home/ApnaMistri/workers/{worker_uid}/jobs/{job_id}/{stage}"

    filename = f"{stage}_{os.urandom(4).hex()}.jpg"

    return upload_pil_image(
        pil_image,
        filename,
        folder
    )

# -------------------------
# Customer profile photo
# -------------------------

def upload_user_profile(uid, file):
    file_to_up=file.read()
    folder= f"Home/ApnaMistri/users/{uid}"
    filename = f"profile_{uid}.jpg"
    upload= imagekit.files.upload(
        file=file_to_up,
        file_name=filename,
        folder=folder
    )
    print("✅ Upload successful:", upload)
    return upload.url



    

# -------------------------
# Delete file
# -------------------------

def delete_imagekit_file(file_id):

    try:
        imagekit.delete_file(file_id)
        return True
    except Exception as e:
        print("❌ Delete failed:", e)
        return False
