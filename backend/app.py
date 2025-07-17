#!/usr/bin/env python3
"""
Simple entry point for the certificate service
This file can be used as the main entry point for deployment
"""

from certificate_service import app

if __name__ == '__main__':
    import os
    
    # Get port from environment variable (for cloud deployment) or default to 5001
    port = int(os.environ.get('PORT', 5001))
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=port, debug=False)
