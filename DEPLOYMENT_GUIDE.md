# Certificate Service Deployment Guide

## Problem Solved

The original issue was that `docx2pdf` doesn't work on Linux servers (like Render.com) because it requires Microsoft Word. This caused the "docx2pdf is not implemented for linux" error.

## Solution Implemented

We've implemented a **three-tier fallback system** for PDF conversion:

### 1. Primary: docx2pdf (Windows only)
- Works on Windows with Microsoft Word installed
- Provides the best formatting fidelity
- **Status**: Will fail on Linux servers

### 2. Secondary: LibreOffice (Cross-platform)
- Works on Linux, Windows, and macOS
- Good formatting fidelity
- Installed during build process on Render
- **Status**: Should work on Render

### 3. Tertiary: reportlab (Pure Python)
- Works everywhere Python works
- Creates a simple but functional certificate
- No external dependencies
- **Status**: Guaranteed fallback

## Files Modified

### Configuration Files
- `render.yaml` - Fixed app reference and added gunicorn timeout
- `Procfile` - Updated to match render.yaml
- `build.sh` - Improved LibreOffice installation
- `backend/requirements.txt` - Added reportlab dependency

### Code Files
- `backend/certificate_service.py` - Enhanced with:
  - Comprehensive logging
  - Three-tier conversion system
  - Better error handling
  - Enhanced health check endpoint

### Test Files (New)
- `test_deployment.py` - Test the full service
- `check_dependencies.py` - Verify all dependencies
- `test_libreoffice.py` - Test LibreOffice specifically
- `test_all_conversions.py` - Test all conversion methods

## Testing Before Deployment

Run these commands to test locally:

```bash
# Check dependencies
python check_dependencies.py

# Test LibreOffice conversion
python test_libreoffice.py

# Test all conversion methods
python test_all_conversions.py

# Test full service
python test_deployment.py
```

## Deployment Process

1. **Commit and push** your changes to your repository
2. **Deploy to Render** - the build script will:
   - Install LibreOffice
   - Install Python dependencies including reportlab
   - Set up the service

3. **Monitor deployment** using the enhanced health check:
   ```
   GET https://your-app.onrender.com/health
   ```

## Health Check Information

The `/health` endpoint now provides detailed information:

```json
{
  "status": "healthy",
  "service": "certificate-generator",
  "docx2pdf_available": false,
  "reportlab_available": true,
  "libreoffice_available": true,
  "template_exists": true,
  "current_directory": "/opt/render/project/src/backend",
  "python_version": "3.9.18",
  "platform": "Linux"
}
```

## Expected Behavior on Render

1. **docx2pdf**: Will fail (expected on Linux)
2. **LibreOffice**: Should work (installed during build)
3. **reportlab**: Will work (pure Python fallback)

The service will automatically fall back through these methods until one succeeds.

## Troubleshooting

### If LibreOffice fails:
- Check the health endpoint for `libreoffice_available: false`
- The service will fall back to reportlab
- Certificate will be generated with simpler formatting

### If all methods fail:
- Check the logs for detailed error messages
- Verify the template file exists
- Ensure all dependencies are installed

### Common Issues:
1. **Template not found**: Ensure `SpectoV_Cert.docx` is in the backend directory
2. **Permission errors**: Check file permissions in the deployment environment
3. **Timeout errors**: The gunicorn timeout is set to 120 seconds for longer conversions

## Logs and Debugging

The service now includes comprehensive logging. Check the Render logs for:
- Conversion method attempts
- Success/failure messages
- File system information
- Error details

## Performance Notes

- **docx2pdf**: Fastest (when available)
- **LibreOffice**: Medium speed, good quality
- **reportlab**: Fast, but simpler formatting

The fallback system ensures your service will always work, even if the preferred conversion method fails.
