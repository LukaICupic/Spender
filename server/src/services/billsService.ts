import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { DecodeHintType, BarcodeFormat, BrowserMultiFormatReader } from '@zxing/library';

export const getBills = async () => {
    try {
        const imagePath = path.resolve(__dirname, '../testImg/testImg2.jpeg');

        // hints
        const hints = new Map();
        const formats = [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX, BarcodeFormat.PDF_417, BarcodeFormat.UPC_A];
        hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);

        const reader = new BrowserMultiFormatReader();
        reader.decodeFromImage(imagePath);
    } catch (error) {
        console.error('Error decoding the image:', error);
        throw error; // Optional: rethrow or handle as needed
    }
};