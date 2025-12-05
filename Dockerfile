# Use a lightweight Node image
FROM node:22-slim

# Install LibreOffice for conversions
RUN apt-get update && \
    apt-get install -y libreoffice && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Build your Next.js project
RUN npm run build

EXPOSE 3000

# Run the app
CMD ["npm", "start"]