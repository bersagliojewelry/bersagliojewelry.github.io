import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

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

// Load vehicle data
const rawData = readFileSync(new URL('../data/vehiculos.json', import.meta.url), 'utf-8');
const data = JSON.parse(rawData);

async function uploadVehicles() {
    const vehicles = data.vehiculos || [];
    console.log(`Uploading ${vehicles.length} vehicles...`);

    for (const vehicle of vehicles) {
        await setDoc(doc(db, 'vehiculos', String(vehicle.id)), vehicle);
        process.stdout.write('.');
    }
    console.log('\nAll vehicles uploaded!');
}

async function uploadBrands() {
    const brands = data.marcas || [];
    console.log(`Uploading ${brands.length} brands...`);

    for (const brand of brands) {
        await setDoc(doc(db, 'marcas', brand.id), brand);
        process.stdout.write('.');
    }
    console.log('\nAll brands uploaded!');
}

async function verify() {
    const vehiclesSnap = await getDocs(collection(db, 'vehiculos'));
    const brandsSnap = await getDocs(collection(db, 'marcas'));
    console.log(`\nVerification: ${vehiclesSnap.size} vehicles, ${brandsSnap.size} brands in Firestore`);
}

async function main() {
    console.log('=== ALTORRA CARS - Upload to Firestore ===\n');
    await uploadVehicles();
    await uploadBrands();
    await verify();
    console.log('\nDone! Data is now in Firestore.');
    process.exit(0);
}

main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
