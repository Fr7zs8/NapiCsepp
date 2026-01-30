FROM node:20.19-alpine
WORKDIR /NapicseppFrontend
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]