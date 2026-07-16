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

# პაკეტების კოპირება და ინსტალაცია
COPY package*.json ./
RUN npm install

# კოპირდება მხოლოდ კოდის ფაილები და კონფიგურაცია
# ამით თავიდან ვიცილებთ ლოკალური node_modules-ის კოპირებას და permissions-ის პრობლემას!
COPY tsconfig.json ./
COPY src ./src

EXPOSE 5000

# სერვერის პირდაპირ გაშვება TypeScript-ით (არანაირი tsc ბილდის შეცდომა!)
CMD ["npx", "ts-node", "src/server.ts"]