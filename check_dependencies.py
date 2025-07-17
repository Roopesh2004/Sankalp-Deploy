#!/usr/bin/env python3
"""
Check if all required dependencies are available for the certificate service
"""

import sys
import subprocess
import importlib

def check_python_packages():
    """Check if all required Python packages are installed"""
    required_packages = [
        'flask',
        'flask_cors',
        'docx',
        'gunicorn'
    ]
    
    optional_packages = [
        'docx2pdf'
    ]
    
    print("Checking Python packages...")
    
    missing_required = []
    missing_optional = []
    
    for package in required_packages:
        try:
            importlib.import_module(package)
            print(f"✓ {package}")
        except ImportError:
            print(f"✗ {package} (REQUIRED)")
            missing_required.append(package)
    
    for package in optional_packages:
        try:
            importlib.import_module(package)
            print(f"✓ {package}")
        except ImportError:
            print(f"⚠ {package} (OPTIONAL)")
            missing_optional.append(package)
    
    return missing_required, missing_optional

def check_system_dependencies():
    """Check if system dependencies are available"""
    print("\nChecking system dependencies...")
    
    # Check for LibreOffice
    libreoffice_commands = [
        'libreoffice',
        'soffice',
        '/usr/bin/libreoffice',
        '/usr/bin/soffice',
        '/opt/libreoffice/program/soffice'
    ]
    
    libreoffice_found = False
    for cmd in libreoffice_commands:
        try:
            result = subprocess.run([cmd, '--version'], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                print(f"✓ LibreOffice found: {cmd}")
                print(f"  Version: {result.stdout.strip()}")
                libreoffice_found = True
                break
        except (subprocess.TimeoutExpired, FileNotFoundError):
            continue
    
    if not libreoffice_found:
        print("⚠ LibreOffice not found (needed for PDF conversion fallback)")
    
    return libreoffice_found

def check_template_file():
    """Check if the certificate template exists"""
    print("\nChecking template file...")
    
    import os
    template_path = "backend/SpectoV_Cert.docx"
    
    if os.path.exists(template_path):
        print(f"✓ Template file found: {template_path}")
        file_size = os.path.getsize(template_path)
        print(f"  Size: {file_size} bytes")
        return True
    else:
        print(f"✗ Template file not found: {template_path}")
        print(f"  Current directory: {os.getcwd()}")
        print(f"  Files in backend/: {os.listdir('backend') if os.path.exists('backend') else 'backend directory not found'}")
        return False

def main():
    """Main check function"""
    print("Certificate Service Dependency Check")
    print("=" * 40)
    
    # Check Python packages
    missing_required, missing_optional = check_python_packages()
    
    # Check system dependencies
    libreoffice_available = check_system_dependencies()
    
    # Check template file
    template_available = check_template_file()
    
    # Summary
    print("\n" + "=" * 40)
    print("SUMMARY")
    print("=" * 40)
    
    if missing_required:
        print(f"❌ Missing required packages: {', '.join(missing_required)}")
        print("   Install with: pip install " + " ".join(missing_required))
    else:
        print("✓ All required Python packages are available")
    
    if missing_optional:
        print(f"⚠ Missing optional packages: {', '.join(missing_optional)}")
        print("   Install with: pip install " + " ".join(missing_optional))
    
    if not libreoffice_available:
        print("⚠ LibreOffice not available (PDF conversion fallback won't work)")
    
    if not template_available:
        print("❌ Certificate template file is missing")
    
    # Overall status
    if not missing_required and template_available:
        print("\n🎉 Service dependencies are ready!")
        if missing_optional and not libreoffice_available:
            print("   Note: PDF conversion may have limited functionality")
        return True
    else:
        print("\n❌ Service has missing dependencies that need to be resolved")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
