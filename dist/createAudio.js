"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAudioFileFromText = void 0;
const dotenv = __importStar(require("dotenv"));
const elevenlabs_1 = require("elevenlabs");
const fs_1 = require("fs");
const uuid_1 = require("uuid");
dotenv.config();
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const client = new elevenlabs_1.ElevenLabsClient({
    apiKey: ELEVENLABS_API_KEY,
});
const createAudioFileFromText = (text) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const audio = yield client.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
                model_id: 'eleven_multilingual_v2',
                text,
                output_format: 'mp3_44100_128',
                // Optional voice settings that allow you to customize the output
                voice_settings: {
                    stability: 0,
                    similarity_boost: 0,
                    use_speaker_boost: true,
                    speed: 1.0,
                },
            });
            const fileName = `${(0, uuid_1.v4)()}.mp3`;
            const fileStream = (0, fs_1.createWriteStream)(fileName);
            audio.pipe(fileStream);
            fileStream.on('finish', () => resolve(fileName)); // Resolve with the fileName
            fileStream.on('error', reject);
        }
        catch (error) {
            reject(error);
        }
    }));
});
exports.createAudioFileFromText = createAudioFileFromText;
