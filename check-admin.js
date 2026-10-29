// Firebase Admin SDK ile admin member kaydını kontrol et
const admin = require('firebase-admin');

// Firebase config
const serviceAccount = {
  projectId: "lavoradesign-49ae4",
  databaseURL: "https://lavoradesign-49ae4-default-rtdb.firebaseio.com"
};

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: serviceAccount.databaseURL
});

const db = admin.database();
const adminUid = 'd03bSvP9kOY5IiRg46RY875tV1j1';
const memberPath = `/orgs/lavora-main/members/${adminUid}`;

console.log(`Kontrol ediliyor: ${memberPath}`);

db.ref(memberPath).once('value')
  .then(snapshot => {
    if (snapshot.exists()) {
      console.log('✅ Admin member kaydı MEVCUT:');
      console.log(JSON.stringify(snapshot.val(), null, 2));
    } else {
      console.log('❌ Admin member kaydı YOK!');
      console.log('\nAdmin member kaydı oluşturuluyor...');
      
      const memberData = {
        role: "admin",
        status: "active",
        assignedBy: "system-init",
        assignedAt: Date.now(),
        updatedAt: Date.now()
      };
      
      return db.ref(memberPath).set(memberData)
        .then(() => {
          console.log('✅ Admin member kaydı oluşturuldu!');
          console.log(JSON.stringify(memberData, null, 2));
        });
    }
  })
  .then(() => {
    console.log('\n✅ İşlem tamamlandı');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ HATA:', error);
    process.exit(1);
  });
