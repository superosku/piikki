FROM node:14-slim

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY webpack.config.js ./
COPY frontend ./frontend

RUN ./node_modules/webpack/bin/webpack.js

FROM python:3.5-slim

WORKDIR /app

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY --from=0 /app/build ./build

COPY backend ./backend
COPY autoapp.py ./
COPY conftest.py ./
COPY index.html ./
COPY pytest.ini ./

CMD ["gunicorn", "-b", "0.0.0.0:8000", "autoapp:app"]

