// Firebase Admin Setup Script
// Bu script'i Node.js ile çalıştır: node setup-admin.js

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Firebase Console'dan indir

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://lavoradesign-49ae4-default-rtdb.firebaseio.com'
});

const db = admin.database();
const adminUID = 'd03bSvP9kOY5IiRg46RY875tV1j1';
const orgId = 'lavora-main';

async function setupAdmin() {
  try {
    // Admin member kaydı oluştur
    await db.ref(`orgs/${orgId}/members/${adminUID}`).set({
      role: 'admin',
      status: 'active',
      assignedBy: 'system',
      assignedAt: Date.now(),
      updatedAt: Date.now()
    });
    
    console.log('✅ Admin member kaydı oluşturuldu!');
    
    // User profile oluştur (isteğe bağlı)
    const userRecord = await admin.auth().getUser(adminUID);
    await db.ref(`userProfiles/${adminUID}`).set({
      displayName: userRecord.displayName || 'Admin',
      email: userRecord.email,
      photoURL: userRecord.photoURL || '',
      createdAt: Date.now(),
      lastSeenAt: Date.now()
    });
    
    console.log('✅ User profile oluşturuldu!');
    console.log('\n🎉 Setup tamamlandı! Artık admin olarak giriş yapabilirsin.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

setupAdmin();
