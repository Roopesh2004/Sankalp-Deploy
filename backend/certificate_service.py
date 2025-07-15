from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from docx import Document
from datetime import datetime
from docx2pdf import convert
import os
import tempfile
import uuid
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def generate_certificate(name, domain, start_date, end_date, gender):
    print("Name: ",name)
    """
    Generate a certificate with the provided details
    Returns the path to the generated PDF file
    """
    try:
        # === Pronoun mapping ===
        pronouns = {"male": ("he", "him"), "female": ("she", "her"), "other": ("they", "them")}
        he_she, him_her = pronouns.get(gender.lower(), ("they", "them"))

        issued_date = datetime.today().strftime('%B %d, %Y')

        # === Load and fill Word document ===
        template_path = "SpectoV_Cert.docx"
        if not os.path.exists(template_path):
            raise FileNotFoundError(f"Certificate template not found: {template_path}")
            
        doc = Document(template_path)

        # Replace placeholders in all paragraphs
        for para in doc.paragraphs:
            if "{{Domain}}" in para.text:
                para.text = para.text.replace("{{Domain}}", domain)
            if "{{Start Date}}" in para.text:
                para.text = para.text.replace("{{Start Date}}", start_date)
            if "{{End Date}}" in para.text:
                para.text = para.text.replace("{{End Date}}", end_date)
            if "{{he/she/they}}" in para.text:
                para.text = para.text.replace("{{he/she/they}}", he_she)
            if "{{him/her/them}}" in para.text:
                para.text = para.text.replace("{{him/her/them}}", him_her)
            if "{{Name}}" in para.text:
                para.text = para.text.replace("{{Name}}", name)
            if "ISSUED DATE :" in para.text:
                para.text = para.text.replace("ISSUED DATE :", f"ISSUED DATE : {issued_date}")

        # Also check tables for placeholders
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    for para in cell.paragraphs:
                        if "{{Domain}}" in para.text:
                            para.text = para.text.replace("{{Domain}}", domain)
                        if "{{Start Date}}" in para.text:
                            para.text = para.text.replace("{{Start Date}}", start_date)
                        if "{{End Date}}" in para.text:
                            para.text = para.text.replace("{{End Date}}", end_date)
                        if "{{he/she/they}}" in para.text:
                            para.text = para.text.replace("{{he/she/they}}", he_she)
                        if "{{him/her/them}}" in para.text:
                            para.text = para.text.replace("{{him/her/them}}", him_her)
                        if "{{Name}}" in para.text:
                            para.text = para.text.replace("{{Name}}", name)
                        if "ISSUED DATE :" in para.text:
                            para.text = para.text.replace("ISSUED DATE :", f"ISSUED DATE : {issued_date}")

        # === Generate unique filenames ===
        unique_id = str(uuid.uuid4())
        output_docx = f"temp_certificate_{unique_id}.docx"
        output_pdf = f"certificate_{unique_id}.pdf"
        
        # === Save DOCX ===
        doc.save(output_docx)

        # === Convert to PDF ===
        convert(output_docx, output_pdf)

        # Clean up the temporary DOCX file
        if os.path.exists(output_docx):
            os.remove(output_docx)

        print("Returning PDF")

        return output_pdf

    except Exception as e:
        raise Exception(f"Error generating certificate: {str(e)}")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "certificate-generator"})

@app.route('/generate-certificate', methods=['POST'])
def generate_certificate_api():
    """
    API endpoint to generate certificate
    Expected JSON payload:
    {
        "name": "John Doe",
        "domain": "Web Development",
        "start_date": "January 1, 2024",
        "end_date": "March 31, 2024",
        "gender": "male"  // optional, defaults to "other"
    }
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No JSON data provided"
            }), 400
        
        # Extract required fields
        name = data.get('name')
        domain = data.get('domain')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        gender = data.get('gender', 'other')
        
        # Validate required fields
        if not all([name, domain, start_date, end_date]):
            return jsonify({
                "success": False,
                "error": "Missing required fields: name, domain, start_date, end_date"
            }), 400
        
        # Generate certificate
        pdf_path = generate_certificate(name, domain, start_date, end_date, gender)
        
        # Return the PDF file
        return send_file(
            pdf_path,
            as_attachment=True,
            download_name=f"certificate_{name.replace(' ', '_')}.pdf",
            mimetype='application/pdf'
        )
        
    except FileNotFoundError as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 404
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
    
    finally:
        # Clean up generated PDF file after sending
        try:
            if 'pdf_path' in locals() and os.path.exists(pdf_path):
                # Schedule cleanup after response is sent
                @app.after_request
                def cleanup_file(response):
                    try:
                        if os.path.exists(pdf_path):
                            os.remove(pdf_path)
                    except:
                        pass  # Ignore cleanup errors
                    return response
        except:
            pass  # Ignore cleanup errors

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Endpoint not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500

if __name__ == '__main__':
    # Check if template file exists
    if not os.path.exists("SpectoV_Cert.docx"):
        print("Warning: Certificate template 'SpectoV_Cert.docx' not found in current directory")
    
    print("Starting Certificate Generation Service...")
    print("Health check: http://localhost:5001/health")
    print("Generate certificate: POST http://localhost:5001/generate-certificate")
    
    # Run Flask app on port 5001
    app.run(host='https://sankalp-deploy-2.onrender.com', port=5001, debug=True)
