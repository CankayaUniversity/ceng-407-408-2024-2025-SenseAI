const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const port = 3000;
app.use(express.json());
const cors = require('cors');
app.use(cors()); 
app.use(express.raw({ type: 'application/octet-stream', limit: '10mb' }));
const multer = require('multer');


//http://172.20.10.3:3000/analyze/text
//ngrok config add-authtoken 2utzEWHMkotWii1nJ8yQShBjqW4_4gXsjpgPwHvMoGu2RditF
//ngrok http 3000
// \ud83d\udc40 Yüz Tanıma Modeli
//cd C:\ngrok
//ngrok config add-authtoken 2utzEWHMkotWii1nJ8yQShBjqW4_4gXsjpgPwHvMoGu2RditF
//ngrok config add-authtoken 2utzEWHMkotWii1nJ8yQShBjqW4_4gXsjpgPwHvMoGu2RditF
//ngrok http 3000

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Dosyanın kaydedileceği dizini belirtin
        cb(null, path.join(__dirname, 'uploads'));  // uploads klasörü altında kaydet
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Dosya ismi olarak zaman damgası var
    }
});
const upload = multer({ storage: storage });
const analyzeFaceModel = (filePath) => {
    return new Promise((resolve, reject) => {
        console.log(`📸 Yüz analizi başlatılıyor: ${filePath}`);

        const python = exec(`python models/face_model/face_model.py "${filePath}"`);

        let resultData = "";

        python.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        python.stderr.on('data', (data) => {
            reject({ error: "Face Model Hatası", details: data.toString() });
        });

        python.on('exit', (code) => {
            if (code === 0) {
                resolve({ reply: resultData.trim() });
            } else {
                reject({ error: "Python script hatası", code });
            }
        });
    });
};
// Ses dosyasını analiz eden fonksiyon
const analyzeVoiceModel = (audioPath) => {
    return new Promise((resolve, reject) => {
        console.log(`Ses analizi başlatılıyor: ${audioPath}`);
        
        // Python modelini çağırıyoruz
        const python = exec(`python models/voice_model/Emotion-Classification-Ravdess/live_predictions.py "${audioPath}"`);

        let resultData = "";

        python.stdout.on('data', (data) => {
            // console.log("Model Çıktısı: ", data.toString());  
            resultData += data.toString();
        });

        python.stderr.on('data', (data) => {
            console.log("Model Hatası: ", data.toString()); 
            reject({ error: "Voice Model Hatası", details: data.toString() });
        });

        python.on('exit', (code) => {
            if (code === 0) {
                console.log("Model başarıyla tamamlandı.");
                resolve({ voiceAnalysis: resultData.trim() });
            } else {
                console.log("Python script hatası kod: ", code);
                reject({ error: "Python script hatası", code });
            }
        });
    });
};

// \ud83d\udcdd Metin Analiz Modeli
const analyzeTextModel = (text) => {
    return new Promise((resolve, reject) => {
        console.log("Alınan Metin:", text); // Gelen metni kontrol et

        // Python script'ini çalıştırıyoruz
        const python = exec('python models/text_model_updatede/test.py', (error, stdout, stderr) => {
            // Python script'inden gelen hata mesajlarını kontrol ediyoruz
            if (error) {
                reject({ error: "Python script hatası", details: error.message });
                return;
            }

            // stderr'den gelen bilgilendirme mesajlarını kontrol ediyoruz
            if (stderr && !/tensorflow|TFBertForSequenceClassification/i.test(stderr)) {
                reject({ error: "Python script hata mesajı", details: stderr });
                return;
            }

            // stdout'dan gelen modeli işliyoruz
            if (stdout) {
                // console.log("Model Çıktısı:", stdout); // Modelin tahmin ettiği sonucu yazdırıyoruz
                resolve({ reply: stdout.trim() }); // Modelin cevabını JSON formatında döndürüyoruz
            } else {
                reject({ error: "Boş çıktı", details: "Model herhangi bir çıktı üretmedi." });
            }
        });

        // Python script'ine cümleyi gönderiyoruz
        python.stdin.write(text); // Text verisini stdin üzerinden Python'a gönderiyoruz
        python.stdin.end(); // stdin'e veri göndermeyi tamamlıyoruz
    });
};


//bu chatin güncellediği değerler
function analyzeBioModel(parsedHr, parsedStress) {
    if (parsedHr == null && parsedStress == null) {
        return "Unknown";
    }

    // Her iki veri varsa
    if (parsedHr != null && parsedStress != null) {
        if (parsedHr >= 60 && parsedHr <= 85 && parsedStress >= 0 && parsedStress <= 20) return "happy";
        if (parsedHr >= 85 && parsedHr <= 110 && parsedStress >= 40 && parsedStress <= 60) return "neutral";
        if (parsedHr < 60 && parsedStress >= 40 && parsedStress <= 70) return "sad";
        if (parsedHr >= 100 && parsedHr <= 125 && parsedStress >= 75 && parsedStress <= 100) return "anger";
        if (parsedHr >= 110 && parsedHr <= 135 && parsedStress >= 60 && parsedStress <= 80) return "fear";
        if (parsedHr >= 70 && parsedHr <= 100 && parsedStress >= 85 && parsedStress <= 100) return "disgust";
        if (parsedHr >= 110 && parsedHr <= 140 && parsedStress >= 40 && parsedStress <= 65) return "surprised";
        return "Unknown";
    }

    // Sadece HR varsa
    if (parsedHr != null) {
        if (parsedHr >= 60 && parsedHr <= 85) return "happy";
        if (parsedHr >= 85 && parsedHr <= 110) return "neutral";
        if (parsedHr < 60) return "sad";
        if (parsedHr >= 110 && parsedHr <= 135) return "fear";
        if (parsedHr >= 100 && parsedHr <= 125) return "anger";
        if (parsedHr >= 110 && parsedHr <= 140) return "surprised";
        if (parsedHr >= 70 && parsedHr <= 100) return "disgust";
        return "Unknown";
    }

    // Sadece stress varsa
    if (parsedStress != null) {
        if (parsedStress >= 0 && parsedStress <= 20) return "happy";
        if (parsedStress > 20 && parsedStress <= 40) return "neutral";
        if (parsedStress > 40 && parsedStress <= 70) return "sad";
        if (parsedStress > 70 && parsedStress <= 80) return "fear";
        if (parsedStress > 80 && parsedStress <= 100) return "disgust";
        return "Unknown";
    }

    return "Unknown";
}


const analyzeLLamaModel = (finalEmotion, text) => {
    return new Promise((resolve, reject) => {
        const emotion = finalEmotion.trim();
        const sentence = text.trim().replace(/"/g, '\\"');
        const command = `python models/llama-model/test.py "${emotion}" "${sentence}"`;


        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject({ error: "Python script hatası", details: error.message });
                return;
            }

            if (stderr) {
                console.error("stderr:", stderr);
                // stderr bazen uyarı da olabilir, çıktıyı kontrol etmeden reject etme
            }

            if (stdout) {
                console.log("LLaMA Modeli Çıktısı:", stdout);
                resolve({ reply: stdout.trim() });
            } else {
                reject({ error: "Boş çıktı", details: "Model herhangi bir çıktı üretmedi." });
            }
        });
    });
};

const audioStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'audio_file');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); // klasör yoksa oluştur
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Dosya adını temizliyoruz: boşlukları tire yap, tüm karakterleri küçük harfe çevir
        const cleanFileName = file.originalname
            .replace(/\s+/g, '-')      // Boşlukları tireye çevir
            .toLowerCase();           // Tüm harfleri küçük yap

        const fileExtension = path.extname(cleanFileName); 
        const fileNameWithoutExt = path.basename(cleanFileName, fileExtension);  
        const finalFileName = `${fileNameWithoutExt}${fileExtension}`;  

        cb(null, finalFileName);
    }
});

const uploadAudio = multer({ storage: audioStorage });

const fullUpload = upload.fields([
    { name: 'image[]', maxCount: 10 },
    { name: 'audio_file', maxCount: 1 }
]);

app.get("/", (req, res) => {
  res.send("Sunucu çalışıyor");
});

//hepsi var MUATAFAYLA DENEDİĞİMİZ
app.post('/analyze/full', fullUpload, async (req, res) => {
    const { text, heart_rate, stress } = req.body;

    const parsedHr = heart_rate != null ? parseInt(heart_rate) : null;
    const parsedStress = stress != null ? parseInt(stress) : null;

    console.log('Text:', text);
    console.log('Stress:', parsedStress);
    console.log('HR:', parsedHr);

    // Text zorunlu
    if (!text) {
        return res.status(400).json({ error: "Text verisi gereklidir." });
    }

    const imageFiles = req.files?.['image[]'] || [];
    const audioFile = req.files?.['audio_file']?.[0];
    const audioPath = audioFile ? path.join(__dirname, 'audio_files', audioFile.filename) : null;

    try {
        const textResult = await analyzeTextModel(text);
        console.log("🧠 Text analizi tamamlandı:", textResult.reply);

        let faceEmotion = null;
        const emotionCounts = {};
        const emotionList = [];

        //  Yüz analizi
        if (imageFiles.length > 0) {
            let validDetections = 0;

            for (const file of imageFiles) {
                const imagePath = path.join(__dirname, 'uploads', file.filename);
                const result = await analyzeFaceModel(imagePath);
                const emotion = result.reply.trim();

                if (!emotion.includes("Face could not be detected")) {
                    emotionList.push({ filename: file.originalname, emotion });
                    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
                    validDetections++;
                } else {
                    console.log(`🚫 Yüz tespiti başarısız: ${file.originalname}`);
                }
            }

            if (validDetections > 0) {
                let mostFrequentEmotion = '';
                let maxCount = 0;
                for (const [emotion, count] of Object.entries(emotionCounts)) {
                    if (count > maxCount) {
                        mostFrequentEmotion = emotion;
                        maxCount = count;
                    }
                }
                faceEmotion = mostFrequentEmotion;
                console.log("🧠 En çok görülen yüz duygusu:", faceEmotion);
            } else {
                faceEmotion = null;
                console.log("📸 Geçerli yüz duygusu yok, ağırlık 0 olacak.");
            }
        }

        // Ses analizi
        const voiceResult = audioPath ? await analyzeVoiceModel(audioPath) : null;
        const voiceEmotion = voiceResult?.voiceAnalysis || null;
        if (voiceEmotion) console.log("🎤 Ses analizi tamamlandı:", voiceEmotion);

        // Text duygu
        const textEmotion = textResult.reply;


        //  Bio analiz
        let bioEmotion = null;
        if (parsedHr !== null || parsedStress !== null) {
            const bioResult = await analyzeBioModel(parsedHr, parsedStress);
            bioEmotion = bioResult === 'Unknown' ? null : bioResult;
            if (bioEmotion) console.log("🧠 Bio analiz tamamlandı:", bioEmotion);
        } else {
            console.log("📉 Bio verisi eksik, analiz yapılmadı, ağırlık 0 olacak.");
}
;

        // Duygu haritalama
        const emotionMap = {
            angry: 1, anger: 1,
            fear: 2, fearful: 2,
            disgust: 3,
            sad: 4,
            calm: 5,
            neutral: 5,
            happy: 7,
            surprised: 8, surprise: 8
        };

        const inverseEmotionMap = {
            1: 'angry',
            2: 'fear',
            3: 'disgust',
            4: 'sad',
            5: 'neutral',
            7: 'happy',
            8: 'surprised'
        };

        // Dinamik ağırlık
        let modelWeights = {
            face: faceEmotion ? 0.3 : 0,
            voice: voiceEmotion ? 0.1 : 0,
            text: 1.0 - ((faceEmotion ? 0.3 : 0) + (voiceEmotion ? 0.1 : 0) + (bioEmotion ? 0.1 : 0)),
            bio: bioEmotion ? 0.1 : 0 
        };

        console.log("🏋️‍♂️ Model Ağırlıkları:", modelWeights);

        const faceVal = faceEmotion ? (emotionMap[faceEmotion] || 0) : 0;
        const voiceVal = voiceEmotion ? (emotionMap[voiceEmotion] || 0) : 0;
        const textVal = emotionMap[textEmotion] || 0;
        const bioVal = bioEmotion ? (emotionMap[bioEmotion] || 0) : 0;

        console.log("Face Değeri:", faceVal);
        console.log("Voice Değeri:", voiceVal);
        console.log("Text Değeri:", textVal);
        console.log("Bio Değeri:", bioVal);

        const weightedSum =
            (faceVal * modelWeights.face) +
            (voiceVal * modelWeights.voice) +
            (textVal * modelWeights.text) +
            (bioVal * modelWeights.bio);

        console.log("Ağırlıklı Toplam Skor:", weightedSum);

        const rounded = Math.round(weightedSum);
        const clamped = Math.max(1, Math.min(8, rounded));
        const finalEmotionRaw = inverseEmotionMap[clamped] || 'neutral';
        const finalEmotion = finalEmotionRaw === 'calm' ? 'neutral' : finalEmotionRaw;
        console.log("Final emotin: " , finalEmotion);

        // ✅ LLaMA yanıtı
        const llamaResponse = await analyzeLLamaModel(finalEmotion, text);

        const responseData = {
            faceEmotion: faceEmotion || null,
            faceEmotionCounts: Object.keys(emotionCounts).length ? emotionCounts : null,
            faceEmotionList: emotionList.length ? emotionList : null,
            voiceEmotion,
            bioEmotion,
            textEmotion,
            weights: modelWeights,
            weightedScore: weightedSum.toFixed(2),
            finalEmotion,
            llamaResponse: llamaResponse.reply
        };

        console.log("Response Sent to Client:");
        console.log(JSON.stringify(responseData, null, 2));

        res.json({
            faceEmotion: faceEmotion || null,
            faceEmotionCounts: Object.keys(emotionCounts).length ? emotionCounts : null,
            faceEmotionList: emotionList.length ? emotionList : null,
            voiceEmotion,
            bioEmotion,
            textEmotion,
            weights: modelWeights,
            weightedScore: weightedSum.toFixed(2),
            finalEmotion,
            llamaResponse: llamaResponse.reply
        });

    } catch (error) {
        console.error("💥 Hata:", error);
        res.status(500).json({ error: "Birleştirilmiş analiz hatası", details: error.message });
    }
});

app.listen(port, () => {
    console.log(`\ud83d\ude80 Sunucu http://localhost:${port} adresinde çalışıyor...`);
});
