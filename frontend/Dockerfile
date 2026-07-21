# Tahap 1: Pembangunan (Builder Stage)
FROM node:18-alpine as builder
WORKDIR /app

# Salin file daftar dependensi
COPY package*.json ./

# Instal dependensi
RUN npm install

# Salin semua kode frontend dan bangun versi produksi
COPY . .
RUN npm run build

# Tahap 2: Penyajian (Production Stage) menggunakan Nginx
FROM nginx:alpine

# Salin hasil build dari tahap 1 ke folder default Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Salin konfigurasi Nginx khusus untuk React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ekspos port standar web (80)
EXPOSE 80

# Nyalakan Nginx
CMD ["nginx", "-g", "daemon off;"]
