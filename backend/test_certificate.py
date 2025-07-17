import json
import subprocess
import sys

# Test data
test_data = {
    "name": "Test User",
    "domain": "Web Development", 
    "start_date": "May 1, 2025",
    "end_date": "June 30, 2025",
    "gender": "other"
}

# Convert to JSON string
json_data = json.dumps(test_data)

# Run the certificate generation script
try:
    process = subprocess.Popen(
        [sys.executable, 'generate_certificate.py'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    stdout, stderr = process.communicate(input=json_data)
    
    print("Return code:", process.returncode)
    print("STDOUT:", stdout)
    print("STDERR:", stderr)
    
except Exception as e:
    print(f"Error running script: {e}")
