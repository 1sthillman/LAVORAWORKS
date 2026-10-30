#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UID Düzeltme Script - Tüm dosyalardaki eski UID'yi yeni UID ile değiştirir
"""

import json
import os
import sys

# UID değerleri
ESKİ_UID = "d03bSvP9kOY5IiRg46RY875tV1j1"
YENİ_UID = "d03bSvP9kOY51iRg4GRY87StV1j1"

def dosya_guncelle(dosya_yolu):
    """Dosyadaki tüm eski UID'leri yeni UID ile değiştirir"""
    if not os.path.exists(dosya_yolu):
        print(f"⚠️ {dosya_yolu} bulunamadı, atlanıyor")
        return False
    
    try:
        # UTF-8 ile oku
        with open(dosya_yolu, 'r', encoding='utf-8') as f:
            icerik = f.read()
        
        # Değiştirme sayısını say
        onceki_sayi = icerik.count(ESKİ_UID)
        
        if onceki_sayi == 0:
            print(f"✅ {dosya_yolu} - Zaten güncel")
            return True
        
        # Değiştir
        yeni_icerik = icerik.replace(ESKİ_UID, YENİ_UID)
        
        # UTF-8 ile yaz
        with open(dosya_yolu, 'w', encoding='utf-8', newline='\n') as f:
            f.write(yeni_icerik)
        
        print(f"✅ {dosya_yolu} - {onceki_sayi} adet değiştirildi")
        return True
        
    except Exception as e:
        print(f"❌ {dosya_yolu} - HATA: {e}")
        return False

def main():
    """Ana fonksiyon"""
    print("═" * 70)
    print("🔧 UID DÜZELTME SCRİPTİ")
    print("═" * 70)
    print(f"Eski UID: {ESKİ_UID}")
    print(f"Yeni UID: {YENİ_UID}")
    print("═" * 70)
    print()
    
    # Güncellenecek dosyalar
    dosyalar = [
        "database.rules.json",
        "html/database.rules.json",
        "html/lavora-database-rules.json",
        "html/ADMIN_SETUP_DATABASE.json"
    ]
    
    basarili = 0
    basarisiz = 0
    
    for dosya in dosyalar:
        if dosya_guncelle(dosya):
            basarili += 1
        else:
            basarisiz += 1
    
    print()
    print("═" * 70)
    print(f"✅ Başarılı: {basarili}")
    print(f"❌ Başarısız: {basarisiz}")
    print("═" * 70)
    
    return 0 if basarisiz == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
