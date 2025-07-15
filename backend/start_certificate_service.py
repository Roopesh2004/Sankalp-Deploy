#!/usr/bin/env python3
"""
Startup script for the Certificate Generation Flask Service
"""
import os
import sys

def check_requirements():
    """Check if all required packages are installed"""
    try:
        import flask
        import flask_cors
        from docx import Document
        from docx2pdf import convert
        print("✓ All Python dependencies are installed")
        return True
    except ImportError as e:
        print(f"✗ Missing dependency: {e}")
        print("Please install requirements: pip install -r requirements.txt")
        return False

def check_template():
    """Check if certificate template exists"""
    template_path = "SpectoV_Cert.docx"
    if os.path.exists(template_path):
        print(f"✓ Certificate template found: {template_path}")
        return True
    else:
        print(f"✗ Certificate template not found: {template_path}")
        print("Please ensure the template file is in the backend directory")
        return False

def main():
    print("=== Certificate Generation Service Startup ===")
    print()
    
    # Check dependencies
    if not check_requirements():
        sys.exit(1)
    
    # Check template
    if not check_template():
        sys.exit(1)
    
    print()
    print("Starting Flask Certificate Service...")
    print("Service will be available at: http://localhost:5001")
    print("Health check: http://localhost:5001/health")
    print("Generate certificate: POST http://localhost:5001/generate-certificate")
    print()
    print("Press Ctrl+C to stop the service")
    print("=" * 50)
    
    # Import and run the Flask app
    from certificate_service import app
    app.run(host='0.0.0.0', port=5001, debug=True)

if __name__ == "__main__":
    main()
