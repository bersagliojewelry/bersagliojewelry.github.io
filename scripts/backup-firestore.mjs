import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const firebaseConfig = {
    apiKey: "AIzaSyD9MJrON70mPqZxQqhndgQHNkTZUnnaQIs",
    authDomain: "altorra-cars.firebaseapp.com",
    projectId: "altorra-cars",
    storageBucket: "altorra-cars.firebasestorage.app",
    messagingSenderId: "235148219730",
    appId: "1:235148219730:web:ceabdbc52fdcbe8b85168b",
    measurementId: "G-ZGZ6CVTB73"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTIONS_TO_BACKUP = ['vehiculos', 'marcas', 'config'];

async function backupCollection(collectionName) {
    const snap = await getDocs(collection(db, collectionName));
    const docs = [];
    snap.forEach(doc => {
        docs.push({ id: doc.id, ...doc.data() });
    });
    return docs;
}

async function main() {
    console.log('=== ALTORRA CARS - Firestore Backup ===\n');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const backupDir = join(__dirname, '..', 'backups');

    try {
        mkdirSync(backupDir, { recursive: true });
    } catch (_) {
        // directory exists
    }

    const backup = {
        metadata: {
            exportedAt: new Date().toISOString(),
            projectId: 'altorra-cars',
            collections: COLLECTIONS_TO_BACKUP
        }
    };

    for (const col of COLLECTIONS_TO_BACKUP) {
        console.log(`Backing up "${col}"...`);
        try {
            const docs = await backupCollection(col);
            backup[col] = docs;
            console.log(`  -> ${docs.length} documents`);
        } catch (error) {
            console.warn(`  -> Error backing up "${col}": ${error.message}`);
            backup[col] = [];
        }
    }

    const filename = `backup-${timestamp}.json`;
    const filepath = join(backupDir, filename);

    writeFileSync(filepath, JSON.stringify(backup, null, 2), 'utf-8');
    console.log(`\nBackup saved to: backups/${filename}`);

    // Summary
    console.log('\n--- Summary ---');
    for (const col of COLLECTIONS_TO_BACKUP) {
        console.log(`  ${col}: ${backup[col].length} documents`);
    }
    console.log(`\nTotal size: ${(JSON.stringify(backup).length / 1024).toFixed(1)} KB`);

    process.exit(0);
}

main().catch(err => {
    console.error('Backup failed:', err.message);
    process.exit(1);
});
