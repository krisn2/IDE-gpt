#use Node.js base image
FROM node:18-alpine

#create app directory
WORKDIR /app

#Copy package.json and package-lock.json
COPY package*.json ./

#Install dependencies
RUN npm install

#Copy app files
COPY . .

#Expose port
EXPOSE 3000

#Run app
CMD [ "node", "index.js" ]


FROM python:3.10-alpine

WORKDIR /app

COPY code.py /app/code.py

CMD ["python", "code.py"]