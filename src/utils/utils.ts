import { createCipheriv, createHash, randomBytes, scryptSync } from "crypto"
import * as CryptoJS from "crypto-js"

export const generatePKCEPair = () => {
    const NUM_OF_BYTES = 22 // Total of 44 characters (1 Bytes = 2 char) (standard states that: 43 chars <= verifier <= 128 chars)
    const HASH_ALG = "sha256"
    const randomVerifier = randomBytes(NUM_OF_BYTES).toString("hex")
    const hash = createHash(HASH_ALG).update(randomVerifier).digest("base64")
    const challenge = hash.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") // Clean base64 to make it URL safe
    return { verifier: randomVerifier, challenge }
}

export const encryptText = (text: string, key: string) => {
    const iv = randomBytes(16)
    const algorithm = "aes256"
    const keyEncrypt = scryptSync(key, "salt", 32)

    try {
        const cipher = createCipheriv(algorithm, keyEncrypt, iv)
        const encrypted = cipher.update(text, "utf8", "hex")
        return [encrypted + cipher.final("hex"), Buffer.from(iv).toString("hex")].join("|")
    } catch (error) {
        return error
    }
}

// export const decryptText = (encryptedText:string,key:string) => {
//   try {
//     const algorithm = "aes256";
//     const keyEncrypt = scryptSync(key, "salt", 32);

//     const [encrypted, iv] = encryptedText.split("|");
//     if (!iv) throw new Error("IV not found");
//     const decipher = createDecipheriv(
//       algorithm,
//       keyEncrypt,
//       Buffer.from(iv, "hex")
//     );
//     return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
//   } catch (error) {
//     return error;
//   }
// }

export const decyptTextWithCryptoJS = (encryptedText: string, key: string) => {
    return CryptoJS.AES.decrypt(encryptedText, key).toString(CryptoJS.enc.Utf8)
}

// export const hashProfile = (encryptedField) => {
//   let encrytedProfile = {};
//   for (const [key, value] of Object.entries(testProfile)) {
//     const index = ProfleFieldConfig.indexOf(key);
//     if (typeof value === "object") {
//       if (value instanceof Array) {
//         encrytedProfile[encryptedField[index]]=[];
//         value.map((item) => {
//           if (typeof item === "object") {
//             let subObject = {};
//             for (const [subKey, subValue] of Object.entries(item)) {
//               let keyChild = `${key}.${subKey}`;
//               let indexChild = ProfleFieldConfig.indexOf(keyChild);
//               if (indexChild > -1)
//                 subObject[encryptedField[indexChild]]=subValue;
//             }
//             encrytedProfile[encryptedField[index]].push(subObject);
//           } else {
//             encrytedProfile[encryptedField[index]].push(item);
//           }
//         });
//       }else{
//         encrytedProfile[encryptedField[index]]={};
//         for (const [subKey, subValue] of Object.entries(value)) {
//           let keyChild = `${key}.${subKey}`;
//           let indexChild = ProfleFieldConfig.indexOf(keyChild);
//           if (indexChild > -1)
//             encrytedProfile[encryptedField[index]][encryptedField[indexChild]] = subValue;
//         }
//       }
//     }else{
//       encrytedProfile[encryptedField[index]] = value;
//     }

//   }

//   // ProfleFieldConfig.map(field=>{
//   //   if (test[field]){
//   //     const encryptedFieldName = encryptText(field,ENCRYPT_KEY);
//   //     //const  = encryptText(test[field],'123456');
//   //     encrytedProfile[encryptedFieldName] = encryptText(test[field].toString(),ENCRYPT_KEY);
//   //   }

//   // })
//   return encrytedProfile;
// }

// export const decryptProfile = (encryptedField,encryptedProfile) => {
//   let decryptedProfile = {};
//   for (const [key, value] of Object.entries(encryptedProfile)) {
//     const index = encryptedField.indexOf(key);
//     if (typeof value === "object") {
//       if (value instanceof Array) {
//         decryptedProfile[ProfleFieldConfig[index]]=[];
//         value.map((item) => {
//           if (typeof item === "object") {
//             let subObject = {};
//             for (const [subKey, subValue] of Object.entries(item)) {
//               let indexChild = encryptedField.indexOf(subKey);
//               if (indexChild > -1){
//                 const fieldName = ProfleFieldConfig[indexChild].split(".")[1];
//                 subObject[fieldName]=subValue;
//               }

//             }
//             decryptedProfile[ProfleFieldConfig[index]].push(subObject);
//           } else {
//             decryptedProfile[ProfleFieldConfig[index]].push(item);
//           }
//         });
//       }else{
//         decryptedProfile[ProfleFieldConfig[index]]={};
//         for (const [subKey, subValue] of Object.entries(value)) {
//           let indexChild = encryptedField.indexOf(subKey);
//           if (indexChild > -1){
//             const fieldName = ProfleFieldConfig[indexChild].split(".")[1];
//             decryptedProfile[ProfleFieldConfig[index]][fieldName] = subValue;

//           }
//         }
//       }
//     }
//     else{
//       decryptedProfile[ProfleFieldConfig[index]] = value;
//     }
//   }
//   return decryptedProfile;
// }

// // const encryptedField = encryptField();
// // const hashProfileTest = hashProfile(encryptedField);
// // console.log(encryptedField,hashProfileTest,decryptProfile(encryptedField,hashProfileTest));

// /**
//  * Returns a random number between min (inclusive) and max (exclusive)
//  */
// export const getRandomArbitrary = (min, max) => {
//   return Math.random() * (max - min) + min;
// }

// export const getShortenAddress = (address) => {
//   var res = address.substring(0, 7) + "..." + address.substring(address.length - 4);
//   return res;
// }

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
export const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

// export const shuffle = (array) => {
//   let currentIndex = array.length, randomIndex;

//   // While there remain elements to shuffle...
//   while (currentIndex != 0) {

//     // Pick a remaining element...
//     randomIndex = Math.floor(Math.random() * currentIndex);
//     currentIndex--;

//     // And swap it with the current element.
//     [array[currentIndex], array[randomIndex]] = [
//       array[randomIndex], array[currentIndex]];
//   }

//   return array;
// }

// export const toFix = (x) => {
//   if (Math.abs(x) < 1.0) {
//     var e = parseInt(x.toString().split('e-')[1]);
//     if (e) {
//       x *= Math.pow(10, e - 1);
//       x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
//     }
//   } else {
//     var e = parseInt(x.toString().split('+')[1]);
//     if (e > 20) {
//       e -= 20;
//       x /= Math.pow(10, e);
//       x += (new Array(e + 1)).join('0');
//     }
//   }
//   return x;
// }

export const isDifferentDate = (date1: Date, date2: Date) => {
    return date1.getDate() != date2.getDate() || date1.getMonth() != date2.getMonth() || date1.getFullYear() != date2.getFullYear()
}

// export const getUTCTimespan = ()=>{
//   const timeNow = Math.floor((new Date()).getTime() / 1000)
//   return timeNow;
// }

// export const getUTCDateFromeDate = (date)=>{
//   return date.getTime() / 1000, date.valueOf() / 1000, (date - date.getTimezoneOffset() * 60 * 1000) / 1000;
// }

// export const addDays=(date, days)=>{
//   var result = new Date(date);
//   result.setDate(result.getDate() + days);
//   return result;
// }

// export const getTimeFromTimespan=(timestamp)=>{
//   var d = new Date(timestamp * 1000),	// Convert the passed timestamp to milliseconds
//       yyyy = d.getFullYear(),
//       mm = ('0' + (d.getMonth() + 1)).slice(-2),	// Months are zero based. Add leading 0.
//       dd = ('0' + d.getDate()).slice(-2),			// Add leading 0.
//       hh = d.getHours(),
//       h = hh,
//       min = ('0' + d.getMinutes()).slice(-2),		// Add leading 0.
//       ampm = 'AM',
//       time;

//     if (hh > 12) {
//       h = hh - 12;
//       ampm = 'PM';
//     } else if (hh === 12) {
//       h = 12;
//       ampm = 'PM';
//     } else if (hh == 0) {
//       h = 12;
//     }

//     // ie: 2013-02-18, 8:35 AM
//     time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

//     return time;
// }

// let clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// export const getWeek = (date) =>{
//   date.setHours(0, 0, 0, 0);
//   // Thursday in current week decides the year.
//   date.setDate(date .getDate() + 3 - (date .getDay() + 6) % 7);
//   // January 4 is always in week 1.
//   var week = new Date(date .getFullYear(), 0, 4);
//   // Adjust to Thursday in week 1 and count number of weeks from date to week1.
//  return 1 + Math.round(((date .getTime() - week.getTime()) / 86400000
//                         - 3 + (week.getDay() + 6) % 7) / 7);
// }

// export const validateTime = (clientTime)=>{
//   const serverTime = Date.now()/1000;
//   //Prevent cheat using enc
//   //Require time client and time server difference in 30 seconds
//   const distanceTime = serverTime - clientTime;
//   if (distanceTime > 30) throw new Error("Time not sync");
// }

// export const createDeterministicRandom=()=>{
//   let seed = 0x2F6E2B1;
//   return function() {
//     // Robert Jenkins’ 32 bit integer hash function
//     seed = ((seed + 0x7ED55D16) + (seed << 12))  & 0xFFFFFFFF;
//     seed = ((seed ^ 0xC761C23C) ^ (seed >>> 19)) & 0xFFFFFFFF;
//     seed = ((seed + 0x165667B1) + (seed << 5))   & 0xFFFFFFFF;
//     seed = ((seed + 0xD3A2646C) ^ (seed << 9))   & 0xFFFFFFFF;
//     seed = ((seed + 0xFD7046C5) + (seed << 3))   & 0xFFFFFFFF;
//     seed = ((seed ^ 0xB55A4F09) ^ (seed >>> 16)) & 0xFFFFFFFF;
//     return (seed & 0xFFFFFFF) / 0x10000000;
//   };
// }
