FROM python:3.10-slim

# Install LibreOffice and dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libreoffice \
        libreoffice-writer \
        fonts-dejavu-core \
        fonts-liberation \
        locales && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set UTF-8 locale (LibreOffice needs this sometimes)
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

# Expose the port your Flask app will run on
EXPOSE 10000

# Start the app with Gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:10000", "app:app"]












# FROM python:3.10-slim

# RUN apt-get update && \
#     apt-get install -y libreoffice && \
#     apt-get clean && \
#     rm -rf /var/lib/apt/lists/*

# WORKDIR /app

# COPY . .

# RUN pip install --no-cache-dir -r requirements.txt

# EXPOSE 10000

# CMD ["gunicorn", "-b", "0.0.0.0:10000", "app:app"]
