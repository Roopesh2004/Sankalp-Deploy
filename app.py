from flask import Flask, render_template, request, send_file, jsonify
from flask_cors import CORS
from docxtpl import DocxTemplate
from datetime import datetime
import os
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

TEMPLATE_PATH = "SpectoV_Cert.docx"
OUTPUT_DOCX = "static/Final_Certificate.docx"

pronouns = {
    "male": ("he", "him"),
    "female": ("she", "her"),
    "other": ("they", "them")
}

@app.route('/', methods=['GET', 'POST'])
def generate_certificate():
    if request.method == 'POST':
        name = request.form['name']
        domain = request.form['domain']
        start_date = request.form['start_date']
        end_date = request.form['end_date']
        gender = request.form['gender'].lower()
        he_she, him_her = pronouns.get(gender, ("they", "them"))
        issued_date = datetime.today().strftime('%B %d, %Y')

        if not os.path.exists('static'):
            os.makedirs('static')

        doc = DocxTemplate(TEMPLATE_PATH)
        context = {
            "name": name,
            "domain": domain,
            "start_date": start_date,
            "end_date": end_date,
            "he_she_they": he_she,
            "him_her_them": him_her,
            "issued_date": issued_date
        }
        doc.render(context)
        doc.save(OUTPUT_DOCX)

        os.system(f'libreoffice --headless --convert-to pdf --outdir static {OUTPUT_DOCX}')
        pdf_path = OUTPUT_DOCX.replace('.docx', '.pdf')
        return send_file(pdf_path, as_attachment=True)

    return render_template('form.html')

@app.route('/api/generate-certificate', methods=['POST'])
def generate_certificate_api():
    """
    API endpoint to generate certificate from JSON data
    Expected JSON payload:
    {
        "name": "John Doe",
        "domain": "Web Development",
        "start_date": "May 1, 2025",
        "end_date": "June 30, 2025",
        "gender": "male"
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
        gender = data.get('gender', 'other').lower()

        # Validate required fields
        if not all([name, domain, start_date, end_date]):
            return jsonify({
                "success": False,
                "error": "Missing required fields: name, domain, start_date, end_date"
            }), 400

        # Generate pronouns
        he_she, him_her = pronouns.get(gender, ("they", "them"))
        issued_date = datetime.today().strftime('%B %d, %Y')

        # Create static directory if it doesn't exist
        if not os.path.exists('static'):
            os.makedirs('static')

        # Generate unique filename to avoid conflicts
        unique_id = str(uuid.uuid4())
        output_docx = f"static/Certificate_{unique_id}.docx"
        output_pdf = f"static/Certificate_{unique_id}.pdf"

        # Generate certificate using DocxTemplate
        doc = DocxTemplate(TEMPLATE_PATH)
        context = {
            "name": name,
            "domain": domain,
            "start_date": start_date,
            "end_date": end_date,
            "he_she_they": he_she,
            "him_her_them": him_her,
            "issued_date": issued_date
        }
        doc.render(context)
        doc.save(output_docx)

        # Convert to PDF using LibreOffice
        os.system(f'libreoffice --headless --convert-to pdf --outdir static {output_docx}')

        # Check if PDF was created successfully
        if not os.path.exists(output_pdf):
            return jsonify({
                "success": False,
                "error": "PDF conversion failed"
            }), 500

        # Clean up the temporary DOCX file
        if os.path.exists(output_docx):
            os.remove(output_docx)

        # Return the PDF file
        return send_file(
            output_pdf,
            as_attachment=True,
            download_name=f"{name.replace(' ', '_')}_Certificate.pdf",
            mimetype='application/pdf'
        )

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    # Check if template file exists
    if not os.path.exists(TEMPLATE_PATH):
        print(f"Warning: Certificate template '{TEMPLATE_PATH}' not found")
        print(f"Current working directory: {os.getcwd()}")
        print(f"Files in current directory: {os.listdir('.')}")

    print("Starting Certificate Generation Flask Server...")
    print("Form interface: http://localhost:5002/")
    print("API endpoint: POST http://localhost:5002/api/generate-certificate")

    # Run Flask app on port 5002 to avoid conflicts with Node.js backend
    app.run(host='0.0.0.0', port=5002, debug=True)
