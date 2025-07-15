#!/usr/bin/env python3
"""
Test script to verify the certificate service works before deployment
"""

import requests
import json
import time
import subprocess
import os
import signal
import sys

def test_certificate_service():
    """Test the certificate service endpoints"""
    
    base_url = "http://localhost:5001"
    
    print("Testing Certificate Service...")
    
    # Test health endpoint
    try:
        print("1. Testing health endpoint...")
        response = requests.get(f"{base_url}/health", timeout=10)
        if response.status_code == 200:
            print("✓ Health check passed")
            print(f"  Response: {response.json()}")
        else:
            print(f"✗ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ Health check failed: {e}")
        return False
    
    # Test certificate generation
    try:
        print("\n2. Testing certificate generation...")
        test_data = {
            "name": "John Doe",
            "domain": "Web Development",
            "start_date": "January 1, 2024",
            "end_date": "March 31, 2024",
            "gender": "male"
        }
        
        response = requests.post(
            f"{base_url}/generate-certificate",
            json=test_data,
            timeout=30
        )
        
        if response.status_code == 200:
            print("✓ Certificate generation passed")
            print(f"  Content-Type: {response.headers.get('Content-Type')}")
            print(f"  Content-Length: {len(response.content)} bytes")
            
            # Save the PDF for verification
            with open("test_certificate_output.pdf", "wb") as f:
                f.write(response.content)
            print("  PDF saved as 'test_certificate_output.pdf'")
            
        else:
            print(f"✗ Certificate generation failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"✗ Certificate generation failed: {e}")
        return False
    
    print("\n✓ All tests passed!")
    return True

def start_service():
    """Start the certificate service"""
    print("Starting certificate service...")
    
    # Change to backend directory
    os.chdir("backend")
    
    # Start the service
    process = subprocess.Popen([
        sys.executable, "certificate_service.py"
    ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    
    # Wait a bit for the service to start
    time.sleep(3)
    
    return process

def main():
    """Main test function"""
    print("Certificate Service Deployment Test")
    print("=" * 40)
    
    # Start the service
    service_process = start_service()
    
    try:
        # Wait a bit more for the service to fully start
        time.sleep(2)
        
        # Run tests
        success = test_certificate_service()
        
        if success:
            print("\n🎉 Service is ready for deployment!")
        else:
            print("\n❌ Service has issues that need to be fixed before deployment")
            
    except KeyboardInterrupt:
        print("\nTest interrupted by user")
        
    finally:
        # Clean up
        print("\nStopping service...")
        service_process.terminate()
        try:
            service_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            service_process.kill()
        
        # Clean up test file
        if os.path.exists("test_certificate_output.pdf"):
            os.remove("test_certificate_output.pdf")
            print("Cleaned up test files")

if __name__ == "__main__":
    main()
