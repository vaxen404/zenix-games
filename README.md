# Zenix Games

Zenix Games, oyuncuların dijital oyun kütüphanelerini yönetebileceği, yeni nesil, hızlı ve güvenli bir oyun mağazası ve pazar yeri platformudur. Karanlık teması, modern arayüzü ve performans odaklı altyapısı ile tam bir oyuncu dostu deneyim sunar.

---

## ✨ Özellikler

* 🔐 **Güvenli Kimlik Doğrulama:** Zod ve Nuxt altyapısı ile güçlendirilmiş, anlık validasyon kontrollü kullanıcı kayıt ve giriş sistemi.
* 🛡️ **Gelişmiş Validasyon Kuralları:** Boşluk temizleme, otomatik küçük harfe dönüştürme ve akıllı e-posta kontrol mekanizmaları.
* 📊 **Audit Logs Sistemi:** Kullanıcı hareketlerini ve sistem loglarını anlık olarak kayıt altına alan güvenli yapı.
* 🐘 **PostgreSQL Bağlantı Havuzu (Pooling):** `pg` kütüphanesi ve global pool yönetimi sayesinde geliştirme (dev) ortamında bile sızdırmaz, performanslı veritabanı yönetimi.

---

## 🛠️ Teknolojiler

* **Frontend & Backend:** [Nuxt 3](https://nuxt.com/) (Vue 3, Nitro Engine)
* **Programlama Dili:** [TypeScript](https://www.typescriptlang.org/)
* **State Yönetimi:** [Pinia](https://pinia.vuejs.org/) (Global State Management)
* **Veritabanı:** [PostgreSQL](https://www.postgresql.org/)
* **Validasyon:** [Zod](https://zod.dev/)
* **Stil / Arayüz:** Tailwind CSS

---

## 🚀 Kurulum ve Başlangıç

### 1. Projeyi Klonlayın

git clone https://github.com/vaxen404/zenix-games.git

cd zenix-games

### 2. Bağımlılıkları Yükleyin

npm install

### 3. Çevre Değişkenlerini Ayarlayın
Kök dizinde bir `.env` dosyası oluşturun ve veritabanı bilgilerinizi girin:

DB_USER=postgres

DB_PASSWORD=your_password

DB_HOST=localhost

DB_PORT=5432

DB_DATABASE=espor

### 4. Projeyi Lokal Ortamda Çalıştırın

npm run dev

Tarayıcınızda `http://localhost:3000` adresine giderek projeyi inceleyebilirsiniz.

---

## 📝 Lisans

Bu proje MIT lisansı altında korunmaktadır.