/**
 * Module de chiffrement et déchiffrement pour sécuriser les messages.
 * 
 * Utilise un XOR combiné avec AES pour chiffrer et déchiffrer des messages de manière sécurisée.
 * 
 * @module CHDLock
 */

import CryptoJS from 'crypto-js';

/**
 * Crée une instance de verrouillage (chiffrement et déchiffrement) avec une clé donnée.
 * 
 * @param {string} [key="key"] - La clé utilisée pour le chiffrement. Elle est transformée en un hash MD5.
 * @returns {Object} - Un objet contenant les méthodes `in` et `out` pour chiffrer et déchiffrer les messages.
 */
export default function (key = "key") {
    // Génère une clé hashée à partir de la clé donnée.
    key = CryptoJS.MD5(key).toString();

    return {
        /**
         * Chiffre un message.
         * 
         * @param {any} message - Le message à chiffrer. Peut être de n'importe quel type sérialisable en JSON.
         * @returns {string} - Le message chiffré, encodé en base64.
         */
        in: function (message) {
            // Sérialiser le message en JSON
            message = JSON.stringify(message);

            // Appliquer un XOR avec la clé
            let encoded = '';
            for (let i = 0; i < message.length; i++) {
                encoded += String.fromCharCode(message.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }

            // Chiffrer le message avec AES et le retourner encodé
            return CryptoJS.AES.encrypt(btoa(encoded), key).toString();
        },

        /**
         * Déchiffre un message.
         * 
         * @param {string} encodedMessage - Le message chiffré à déchiffrer.
         * @returns {any} - Le message déchiffré, reconstruit en tant qu'objet ou type original.
         * @throws {Error} - Lance une erreur si le message ne peut pas être déchiffré ou parsé.
         */
        out: function (encodedMessage) {
            // Déchiffrer le message avec AES
            let decoded = atob(CryptoJS.AES.decrypt(encodedMessage, key).toString(CryptoJS.enc.Utf8));
            
            // Appliquer un XOR inverse avec la clé pour retrouver le message original
            let decrypted = '';
            for (let i = 0; i < decoded.length; i++) {
                decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }

            // Parser et retourner l'objet JSON original
            return JSON.parse(decrypted);
        }
    };
}