# 🔥 Basit Firebase Rules - Kopyala Yapıştır

## ✅ Bu Rules ile HERKES giriş yapınca çalışır!

Firebase Console'a git:
https://console.firebase.google.com/project/lavoradesign-49ae4/database/lavoradesign-49ae4-default-rtdb/rules

Aşağıdaki JSON'u **KOPYALA** ve **YAPIŞTIR**:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

**Publish** bas!

## 🎯 Bu Ne Yapar?

- ✅ Giriş yapan herkes okuyabilir
- ✅ Giriş yapan herkes yazabilir
- ✅ Giriş yapmayan kimse erişemez

## ⚠️ Güvenlik Notu

Bu **test rules**! Production'da daha katı kurallar kullanmalısın ama şimdilik her şey çalışır.

---

**ŞİMDİ BU RULES'U FIREBASE CONSOLE'DAN DEPLOY ET!** 🚀
