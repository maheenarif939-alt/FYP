"""
images_gridfs.py
-----------------
Images (scan photos, payment screenshots, doctor verification docs)
are NOT stored in a normal validated collection like the others in
this folder — MongoDB has a built-in system called GridFS just for
files like these.

GridFS automatically creates and manages two collections for you:
    fs.files    — metadata (filename, content type, upload date, etc.)
    fs.chunks   — the actual file data, split into pieces

There is nothing to create or validate here (that's why this file has
no SCHEMA — GridFS handles its own structure), but the helper
functions below match exactly what your backend's api/views.py
already does, so you can test uploading/reading an image from this
folder too, the same way the backend does it.

Used in 3 places in the real backend:
    - cases.image_file_id                  (scan image)
    - cases.payment.screenshot_file_id     (payment screenshot)
    - users.verification_doc_file_id       (doctor verification document)
"""

from gridfs import GridFS

# No COLLECTION_NAME / SCHEMA here on purpose — GridFS manages
# fs.files / fs.chunks itself, so setup_database.py does not (and
# should not) create or validate them like the other collections.


def create_indexes(db):
    # GridFS already creates its own indexes on fs.files and fs.chunks
    # automatically. Nothing to do here — this function exists only so
    # setup_database.py can loop over every module the same way.
    pass


def upload_image(db, file_bytes: bytes, filename: str, content_type: str = "image/jpeg"):
    """
    Saves raw image bytes into GridFS and returns the generated file_id.
    That file_id is what gets stored in cases.image_file_id,
    cases.payment.screenshot_file_id, or users.verification_doc_file_id
    — never the image itself.
    """
    fs = GridFS(db)
    return fs.put(file_bytes, filename=filename, content_type=content_type)


def download_image(db, file_id):
    """
    Reads an image back out of GridFS by its file_id.
    Returns (bytes, content_type).
    """
    fs = GridFS(db)
    grid_out = fs.get(file_id)
    return grid_out.read(), grid_out.content_type


def delete_image(db, file_id):
    """Deletes an image from GridFS by its file_id. Safe no-op if missing."""
    fs = GridFS(db)
    try:
        fs.delete(file_id)
        return True
    except Exception:
        return False


if __name__ == "__main__":
    # Quick manual test: run with  python -m db_collections.images_gridfs
    # from the database/ folder. Uploads a tiny test image, reads it back,
    # then deletes it — confirms GridFS is working end-to-end.
    from mongodb import db

    print("Uploading a small test image to GridFS...")
    fake_image_bytes = b"\xff\xd8\xff\xe0test-image-bytes"
    file_id = upload_image(db, fake_image_bytes, "test.jpg", "image/jpeg")
    print(f"[OK] Uploaded, file_id = {file_id}")

    data, content_type = download_image(db, file_id)
    print(f"[OK] Downloaded back {len(data)} bytes, content_type = {content_type}")

    deleted = delete_image(db, file_id)
    print(f"[OK] Test image deleted: {deleted}")
