# MMPI Mobil Workers Uygulaması

Cloudflare Workers üzerinde çalışan mobil öncelikli MMPI test uygulaması. Ön yüz React + Vite, API aynı Worker içinde, kalıcı kayıt D1 üzerindedir.

## Özellikler

- Kullanıcıdan sadece isim alır.
- 566 soru D/Y formatında gösterilir.
- Sağ elle kullanıma uygun büyük alt cevap kontrolleri vardır.
- Sola/sağa swipe ile Yanlış/Doğru cevaplanabilir.
- Her cevap D1'e kaydedilir.
- Aktif test localStorage'da tutulur; sayfa yenilenirse kaldığı yerden devam eder.
- Sonuçta ham puan, K düzeltmeli puan, T profili, uyarı notları ve grafik gösterilir.

## Yerel Geliştirme

```bash
npm install
npm run cf-typegen
npm run db:migrate:local
npm run dev
```

Yerel URL:

```text
http://127.0.0.1:8787
```

## Deploy

Cloudflare hesabında Wrangler oturumu yoksa önce:

```bash
npx wrangler login
```

D1 veritabanı oluştur:

```bash
npm run db:create
```

Komutun verdiği `database_id` değerini `wrangler.jsonc` içindeki `d1_databases[0].database_id` alanına yaz.

Remote migration ve deploy:

```bash
npm run db:migrate:remote
npm run deploy
```

## Puanlama Notu

Bu uygulama, PDF'teki 566 maddelik Türkçe MMPI soru sırasına göre çalışır. Ölçek anahtarları ve Türkçe norm ortalama/standart sapma değerleri, Işık Savaşır'ın 1981 MMPI el kitabını referans gösteren `MMPI_v2.0.2.xls` çalışma kitabından makro bağımsız veri haline dönüştürülmüştür.

Uygulama ekstra demografik bilgi sormadığı için sonuç ekranı varsayılan olarak kadın/erkek T değerlerinin ortalamasını `Genel` profil olarak gösterir. Sonuç ekranında `Erkek` ve `Kadın` norm profilleri ayrıca seçilebilir. Bu çıktı klinik tanı veya resmi MMPI raporu değildir.

## Veri Saklama

D1'de yalnızca test oturumu id'si, isim, durum, kaldığı soru, cevap JSON'u ve zaman damgaları tutulur. Skorlar kalıcı olarak ayrıca saklanmaz; cevaplardan yeniden hesaplanır.

## Kaynak ve Sınırlılıklar

University of Minnesota Press, MMPI-2'nin profesyonel değerlendirmeye yardımcı bir araç olduğunu, 567 doğru/yanlış maddeden ve geçerlilik/klinik ölçeklerden oluştuğunu belirtir. Pearson'ın resmi ürün sayfası da raporların ham puan, T puanı, K-düzeltilmiş ve non-K profiller içerdiğini ve Qualification Level C gerektirdiğini belirtir. Bu nedenle uygulamadaki sonuçlar yalnızca kayıt ve profil görselleştirme amaçlıdır.
