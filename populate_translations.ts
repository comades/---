import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const extractedStrings = JSON.parse(fs.readFileSync('./extracted_strings.json', 'utf-8'));

async function populate() {
    console.log("Fetching existing translations...");
    const docRef = doc(db, 'system', 'translations');
    const docSnap = await getDoc(docRef);
    const existingTranslations = docSnap.exists() ? docSnap.data() : {};

    const newTranslations = { ...existingTranslations };
    let addedCount = 0;

    for (const str of extractedStrings) {
        if (!newTranslations[str]) {
            newTranslations[str] = {
                'zh-TW': str,
                'zh-CN': '', // To be filled by user or AI
                'en': ''     // To be filled by user or AI
            };
            addedCount++;
        }
    }

    console.log(`Adding ${addedCount} new strings to Firestore...`);
    await setDoc(docRef, newTranslations);
    console.log("Done!");
    process.exit(0);
}

populate().catch(err => {
    console.error(err);
    process.exit(1);
});
