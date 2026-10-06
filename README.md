# Düğün Davetiyesi 💕

"Düğünümüze kalan süre" temalı, pastel tonlarda, zarf açılış animasyonlu tek sayfalık
davetiye sitesi. Raspberry Pi 5 + CasaOS için hazırlanmıştır; internet gerektirmez
(fontlar dahil her şey yereldir).

## Neler var?

- **Yükleme animasyonu**: çizilen nişan yüzükleri ve kalp ile pastel preloader
- **Zarf açılışı**: balmumu mühüre dokununca mühür kırılır, zarf 3D açılır,
  içinden el yazısıyla yazılmış davetiye notu yükselerek büyür
- **Geri sayım**: gün / saat / dakika / saniye, akıcı sayaç animasyonuyla
  (süre bittiğinde kalp yağmuru 🎉)
- **Yüzen yapraklar**: sürekli akan pastel taç yaprakları (canvas)
- **Müzik kutusu**: sağ üstteki not butonu, WebAudio ile üretilen yumuşak bir
  vals çalar (harici dosya yok)
- **Scroll animasyonları**: bölümler yumuşakça belirir, zaman çizgisi kaydırdıkça dolar
- **Takvimime ekle**: düğün günü için .ics dosyası indirir
- Klavye erişilebilirliği, `prefers-reduced-motion` desteği, mobil uyumlu

## Düğün bilgilerini değiştirme

`site/assets/js/main.js` dosyasının en üstündeki `CONFIG` nesnesini düzenleyin:

```js
const CONFIG = {
  nameA: "Şule",                          // gelin/damat adı
  nameB: "Berkay",                           // diğer ad
  dateISO: "2026-10-25T16:00:00+03:00",    // düğün tarihi ve saati (TSİ)
  venueName: "Gül Kurusu Bahçe",           // mekân adı
  venueCity: "Üsküdar, İstanbul",          // ilçe/şehir
  timeLabel: "16:00"                       // davetiyede görünen saat
};
```

Hikâye bölümündeki anıları (`index.html` içinde `tl-item` etiketleri) ve diğer
metinleri de aynı dosyadan değiştirebilirsiniz. Türkçe karakterler desteklidir.

## CasaOS'ta (Raspberry Pi 5) kurulum

### Yöntem 1 — Docker Compose ile (önerilen)

1. Bu klasörü Pi'ye kopyalayın, örneğin: `/DATA/AppData/dugun-davetiye`
2. SSH ile bağlanıp klasör içinde şunu çalıştırın:

```bash
docker compose up -d
```

3. Tarayıcıdan açın: `http://<pi-ip-adresi>:8090`

### Yöntem 2 — CasaOS arayüzünden (Custom App)

1. CasaOS → **App Store** → **Custom Install / Install Manually**
2. Ayarlar:
   - **Image**: `nginx:alpine` (ARM64 destekler)
   - **Ports**: `8090` → `80`
   - **Volumes**: `/DATA/AppData/dugun-davetiye/site` → `/usr/share/nginx/html` (Read Only)
3. Install deyip `http://<pi-ip-adresi>:8090` adresini açın.

### Hızlı test (Docker'sız)

Klasördeki `site` dizinine girip:

```bash
python3 -m http.server 8090
```

### TV / Monitörde tam ekran (kiosk)

Siteyi Pi'ye bağlı bir ekranda sürekli göstermek için:

```bash
chromium-browser --kiosk --noerrdialogs http://localhost:8090
```

## Teknik notlar

- Harici bağımlılık yok: CSS/JS/fontlar tamamen `site/` klasöründedir,
  internet kesilse bile çalışır.
- Fontlar (Cormorant Garamond, Great Vibes, Caveat) Google Fonts'tan
  indirilip yerel `woff2` olarak gömülmüştür; latin-ext (Türkçe) kapsamı dahildir.
- Performans: Pi 5 için optimize — GPU dostu transform/opacity animasyonları,
  sınırlı sayıda parçacık, DPR sınırı 2x.
