FROM node:20-alpine

WORKDIR /app

# Copy dependency files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Build the Next.js application
# Note: For development, we usually just run npm run dev
# but for a complete Dockerfile, we prep it for production
# RUN npm run build

EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
