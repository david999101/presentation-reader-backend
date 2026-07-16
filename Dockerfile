# ვიყენებთ Node-ის სტანდარტულ ვერსიას
FROM node:20

# ვაინსტალირებთ LibreOffice-ს და ბიბლიოთეკებს
RUN apt-get update && apt-get install -y \
    libreoffice \
    libxinerama1 \
    libdbus-glib-1-2 \
    libcairo2 \
    libcups2 \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxt6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

# ვაკოპირებთ მთელ პროექტს
COPY . .

# ვუკეთებთ კომპილაციას JavaScript-ში (ეს შექმნის dist ფოლდერს კონტეინერში)
RUN npm run build --if-present || npx tsc

EXPOSE 5000

# ვუშვებთ დაკომპილირებულ ფაილს
CMD ["node", "dist/server.js"]