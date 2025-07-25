import json, os,key
#import sahayak_ai_y3t06_firebase_adminsdk_fbsvc_a5b7fc9c45

# Assuming you've set FIREBASE_SERVICE_ACCOUNT properly
raw_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")

try:
    data = json.loads(key.x)
    print("Parsed successfully!")
except json.JSONDecodeError as e:
    print("Parsing error:", e)