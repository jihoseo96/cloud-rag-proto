import os, uuid, boto3
from botocore.client import Config

S3_BUCKET = os.getenv("S3_BUCKET")
REGION = os.getenv("REGION","ap-northeast-2")
WORKSPACE = os.getenv("WORKSPACE","personal")

s3 = boto3.client("s3", region_name=REGION, config=Config(s3={'addressing_style':'virtual'}))

def put_pdf(file_bytes: bytes, title: str) -> tuple[str,str]:
    doc_id = uuid.uuid4()
    key = f"{WORKSPACE}/{doc_id}/raw.pdf"
    s3.put_object(Bucket=S3_BUCKET, Key=key, Body=file_bytes, ContentType="application/pdf")
    return doc_id, key

def presign(key: str, expires=3600):
    return s3.generate_presigned_url("get_object", Params={"Bucket": S3_BUCKET, "Key": key}, ExpiresIn=expires)

def get_pdf_bytes(key: str) -> bytes:
    obj = s3.get_object(Bucket=S3_BUCKET, Key=key)
    return obj["Body"].read()
