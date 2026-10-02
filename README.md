# Rota Defteri

Türkiye'nin 81 ili ve 973 ilçesi arasında seyahat rotaları planlama uygulaması (Vite + React + SCSS).

```bash
npm install
npm run dev      # geliştirme sunucusu
npm run data     # public/data/*.json dosyalarını yeniden üretir
```

## Özellikler
- **Nereden → Nereye** il/ilçe seçimi; kuş uçuşu, tahmini yol ve sürüş süresi
- **Rota durumları:** Planlandı · Gittim · Gitmedim · Ertelendi (filtrelenebilir)
- **Favori duraklar:** il, ilçe veya turistik yer; favoriden tek tıkla rota
- **Yakınımda:** tarayıcı konumu (ya da test için il seçimi) ile en yakın yerler, ilçeler ve iller
- Dark/light tema, CSS Grid layout, responsive, veriler `fetch` ile `public/data`'dan yüklenir
- Rotalar ve favoriler `localStorage`'da tutulur

## Veri notu
- İl/ilçe adları, nüfus ve il merkez koordinatları gerçek ([turkiyeapi.dev](https://turkiyeapi.dev)).
- **İlçe koordinatları farazidir** (API sağlamıyor): merkez ilçeler il merkezine ~0-4 km, diğerleri 10-70 km uzağa yerleştirildi. "İl merkezine uzaklık" bu koordinatlardan hesaplanır.
- **Turistik yerler tamamen rastgele test verisidir.**
