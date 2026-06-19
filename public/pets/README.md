# BasePet — 2D Kedi Görselleri

Buraya kedinin ruh hallerine göre görselleri koy. Kod, oyun durumuna göre doğru
görseli gösterir; eksik olanlar otomatik `cat.idle`'a düşer.

## Teknik özellikler
- Format: **GIF / WebP (animasyonlu) veya PNG (statik)** — hepsi şeffaf arka plan.
  Kod uzantıyı otomatik bulur (önce `.gif`, yoksa `.webp`, yoksa `.png`).
- Dosya adı: **noktalı** birincil (`cat.idle.gif`), **tireli** de yedek olarak kabul edilir (`cat-idle.gif`).
- **GIF/WebP** kendi animasyonludur → kod üstüne ekstra hareket bindirmez.
  **PNG** statiktir → kod Framer Motion ile hafifçe canlandırır.
- Boyut: hepsi **aynı**, ~**512–1024** kare, kedi ortalanmış; aynı stil + ölçek.
- **Kısmi set sorun değil:** eksikler otomatik `idle`'a düşer.

## Mevcut dosyalar (kullanıcının ürettiği) ve eşleme

| Dosya | Oyun durumu | Not |
|-------|-------------|-----|
| `cat.idle.gif`  | Boşta (**zorunlu**) | İhtiyaçlar iyiyken. Eksiklerin yedeği. |
| `cat.eat.gif`   | Yerken (Feed) | — |
| `cat.play.gif`  | Oynarken (Play) | — |
| `cat.sleep.gif` | Uyurken (Sleep) | — |
| `cat.happy.gif` | Aksiyon başarılı | TX onaylanınca. |
| `cat.sad.gif`   | Üzgün | Aşağıdaki durumların hepsinde kullanılır ↓ |

## GIF'i olmayan durumlar → `cat.sad` kullanılır
- **Banyo (Bath)** ve **Tuvalet (Toilet)** aksiyonları → `cat.sad` (ayrı GIF yok).
- **Boştayken ihtiyaç düşükse** (aç / uykulu / pis — ihtiyaç barı %30 altı) → idle yerine `cat.sad`.
- TX hatası → `cat.sad`.

## Notlar
- Action animasyonları (eat/play/sleep/happy) ihtiyaç-bazlı sad'den önceliklidir.
- İleride bath/toilet için ayrı GIF üretirsen, `cat.bath.gif` / `cat.toilet.gif` koyman yeterli;
  kod otomatik onları kullanmaya başlar (kodda eşlemeyi güncellerim).
- Görsellerde "Made With Auto Sprite" filigranı ücretsiz sürümden; istersen sonra temizleriz.
