FROM python:3.11

WORKDIR /app

ENV PYTHONUNBUFFERED=1   # 🔥 ADD THIS

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]