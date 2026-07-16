# ვიყენებთ Node-ის ოფიციალურ გარემოს
FROM node:20-slim

# ვაინსტალირებთ LibreOffice-ს და ყველა საჭირო ბიბლიოთეკას
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

# სამუშაო საქაღალდე
WORKDIR /usr/src/app

# პაკეტების ინსტალაცია
COPY package*.json ./
RUN npm install

# კოდის კოპირება და ბილდი
COPY . .
RUN ./node_modules/.bin/tsc

EXPOSE 5000

# სერვერის გაშვება
CMD ["node", "src/server.js"]