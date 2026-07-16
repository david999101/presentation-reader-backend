# ვიყენებთ Node-ის სრულ ვერსიას (სადაც npx-იც არის და ყველაფერიც)
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

# სამუშაო საქაღალდე
WORKDIR /usr/src/app

# პაკეტების კოპირება და ინსტალაცია
COPY package*.json ./
RUN npm install

# კოპირდება მხოლოდ საჭირო ფაილები
COPY tsconfig.json ./
COPY src ./src

EXPOSE 5000

# პირდაპირი გაშვება ts-node-ით (npx-ის გარეშე)
CMD ["node", "./node_modules/.bin/ts-node", "src/server.ts"]