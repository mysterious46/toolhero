import { Layers, Scissors, RotateCw, FileText, Type, ImagePlus, Minimize2, Image, Move, RefreshCw, ArrowRightLeft, QrCode, Code, Sparkles, Crop, Maximize2, EyeOff, Smile, Palette, UserCheck, Key, ArrowRightLeft as DiffIcon, AlignLeft, ShieldCheck, Lock, Search, Network, Music, Film, Radio, FileOutput, FileInput } from 'lucide-react';

// Lazy imports for tool components
import MergePdf from './tools/MergePdf';
import SplitPdf from './tools/SplitPdf';
import RotatePdf from './tools/RotatePdf';
import CompressPdf from './tools/CompressPdf';
import WatermarkPdf from './tools/WatermarkPdf';
import ImagesToPdf from './tools/ImagesToPdf';
import ReorderPages from './tools/ReorderPages';
import PdfToImages from './tools/PdfToImages';
import ExtractPdfText from './tools/ExtractPdfText';
import WordToPdf from './tools/WordToPdf';
import PdfToWord from './tools/PdfToWord';

import CompressImage from './tools/CompressImage';
import ResizeImage from './tools/ResizeImage';
import CropImage from './tools/CropImage';
import ConvertFormat from './tools/ConvertFormat';
import RotateFlipImage from './tools/RotateFlipImage';
import FaviconGenerator from './tools/FaviconGenerator';
import RemoveBgImage from './tools/RemoveBgImage';
import WatermarkImage from './tools/WatermarkImage';
import BlurImage from './tools/BlurImage';
import MemeGenerator from './tools/MemeGenerator';
import ColorPalette from './tools/ColorPalette';
import PassportPhotoGenerator from './tools/PassportPhotoGenerator';

import WordCounter from './tools/WordCounter';
import PasswordGenerator from './tools/PasswordGenerator';
import DiffChecker from './tools/DiffChecker';
import CaseConverter from './tools/CaseConverter';

import HashIdentifier from './tools/HashIdentifier';
import CryptoStudio from './tools/CryptoStudio';
import PasswordAnalyzer from './tools/PasswordAnalyzer';
import JwtDecoder from './tools/JwtDecoder';
import RsaGenerator from './tools/RsaGenerator';
import SubnetCalculator from './tools/SubnetCalculator';

import AudioTrimmer from './tools/AudioTrimmer';
import VideoToGif from './tools/VideoToGif';
import ExtractAudio from './tools/ExtractAudio';

import QrCodeStudio from './tools/QrCodeStudio';
import JsonStudio from './tools/JsonStudio';

export const CATEGORIES = [
  { id: 'pdf', name: 'PDF Tools', color: 'blue', description: 'Merge, split, compress, convert, watermark, and edit PDFs online. Convert Word to PDF & PDF to Word. All processing happens 100% in your browser — private and free.' },
  { id: 'image', name: 'Image Tools', color: 'green', description: 'Compress, resize, crop, convert, remove background, watermark, blur, and create passport photos online for free.' },
  { id: 'text', name: 'Text & Dev Tools', color: 'purple', description: 'Word counter, password & hash generator, text diff checker, case converter, and developer utilities online.' },
  { id: 'security', name: 'Security & Crypto', color: 'red', description: 'Hash identifier, AES encryption & decryption, JWT inspector, RSA key generator, and IPv4 subnet calculator.' },
  { id: 'media', name: 'Audio & Video', color: 'amber', description: 'Audio trimmer with waveform visualizer, Video to GIF converter, and Audio Extractor online for free.' },
  { id: 'other', name: 'Other Tools', color: 'purple', description: 'Custom QR code generator with logo, JSON formatter, and TypeScript type generator.' },
];

export const TOOLS = [
  // PDF Tools (11 Tools)
  { id: 'compress-pdf', cat: 'pdf', title: 'Compress PDF', seoTitle: 'Compress PDF Online Free - Reduce PDF File Size | ToolHero', desc: 'Reduce PDF file size up to 80% without losing quality. 100% private, client-side, and free.', keywords: 'compress pdf online, reduce pdf size, pdf compressor free, toolhero', icon: Minimize2, component: CompressPdf },
  { id: 'merge-pdf', cat: 'pdf', title: 'Merge PDF', seoTitle: 'Merge PDF Files Online Free - Combine PDFs | ToolHero', desc: 'Combine multiple PDF files into one single organized document. Fast, secure, and free.', keywords: 'merge pdf, combine pdf files, pdf joiner online, toolhero', icon: Layers, component: MergePdf },
  { id: 'split-pdf', cat: 'pdf', title: 'Split PDF', seoTitle: 'Split PDF Online Free - Extract PDF Pages | ToolHero', desc: 'Extract specific pages or split PDF documents into separate files instantly.', keywords: 'split pdf online, extract pdf pages, pdf splitter free, toolhero', icon: Scissors, component: SplitPdf },
  { id: 'pdf-to-images', cat: 'pdf', title: 'PDF to JPG', seoTitle: 'PDF to JPG Converter Online Free - Convert PDF to Images | ToolHero', desc: 'Convert PDF pages to high-resolution PNG or JPG images directly in your browser.', keywords: 'pdf to jpg, pdf to image converter, pdf to png online, toolhero', icon: ImagePlus, component: PdfToImages },
  { id: 'images-to-pdf', cat: 'pdf', title: 'JPG to PDF', seoTitle: 'JPG to PDF Converter Online Free - Convert Images to PDF | ToolHero', desc: 'Convert JPG, PNG, and WebP images into a clean PDF document online.', keywords: 'jpg to pdf, convert images to pdf, photo to pdf converter, toolhero', icon: FileText, component: ImagesToPdf },
  { id: 'rotate-pdf', cat: 'pdf', title: 'Rotate PDF', seoTitle: 'Rotate PDF Pages Online Free - Permanent Rotation | ToolHero', desc: 'Rotate individual or all PDF pages by 90°, 180°, or 270° degrees permanently.', keywords: 'rotate pdf online, turn pdf pages, change pdf orientation, toolhero', icon: RotateCw, component: RotatePdf },
  { id: 'watermark-pdf', cat: 'pdf', title: 'Watermark PDF', seoTitle: 'Add Watermark to PDF Online Free - Custom Text Watermark | ToolHero', desc: 'Add custom text watermarks across all PDF pages with font, size, and opacity controls.', keywords: 'watermark pdf online, add text to pdf, stamp pdf free, toolhero', icon: Type, component: WatermarkPdf },
  { id: 'reorder-pages', cat: 'pdf', title: 'Reorder PDF Pages', seoTitle: 'Reorder PDF Pages Online Free - Rearrange Page Sequence | ToolHero', desc: 'Rearrange, swap, and reorder PDF page sequence with drag-and-drop ease.', keywords: 'reorder pdf pages, organize pdf online, swap pdf page order, toolhero', icon: Move, component: ReorderPages },
  { id: 'extract-pdf-text', cat: 'pdf', title: 'Extract PDF Text', seoTitle: 'Extract Text from PDF Online Free - Free PDF Text Extractor | ToolHero', desc: 'Extract raw, clean, selectable text content from PDF documents instantly.', keywords: 'extract text from pdf, pdf text extractor, read pdf text online, toolhero', icon: FileText, component: ExtractPdfText },
  { id: 'word-to-pdf', cat: 'pdf', title: 'Word to PDF', seoTitle: 'Word to PDF Converter Online Free - Convert DOCX to PDF | ToolHero', desc: 'Convert Word documents (.docx) to PDF format with live preview and page size options.', keywords: 'word to pdf converter, docx to pdf online free, convert word document to pdf, toolhero', icon: FileOutput, component: WordToPdf },
  { id: 'pdf-to-word', cat: 'pdf', title: 'PDF to Word', seoTitle: 'PDF to Word Converter Online Free - Convert PDF to DOCX | ToolHero', desc: 'Convert PDF documents to editable Word (.docx) files with text extraction and formatting.', keywords: 'pdf to word converter, pdf to docx online free, convert pdf to word document, toolhero', icon: FileInput, component: PdfToWord },

  // Image Tools (12 Tools)
  { id: 'passport-photo', cat: 'image', title: 'Passport Photo Maker', seoTitle: 'Passport Photo Maker Online Free - Printable 4x6 Sheet | ToolHero', desc: 'Create US, India, UK & EU passport size photos with printable 4x6 sheet layout.', keywords: 'passport photo maker online, free passport photo 4x6, visa photo creator, toolhero', icon: UserCheck, component: PassportPhotoGenerator },
  { id: 'compress-image', cat: 'image', title: 'Compress Image', seoTitle: 'Compress Image Online Free - Reduce JPG, PNG & WebP | ToolHero', desc: 'Reduce image file size with live quality preview and custom target compression slider.', keywords: 'compress image online, reduce photo size, png compressor, jpg shrinker, toolhero', icon: Minimize2, component: CompressImage },
  { id: 'resize-image', cat: 'image', title: 'Resize Image', seoTitle: 'Resize Image Online Free - Change Photo Dimensions | ToolHero', desc: 'Change image width and height dimensions, scale photos, and maintain aspect ratio.', keywords: 'resize image online, change photo dimensions, image scaler, toolhero', icon: Maximize2, component: ResizeImage },
  { id: 'crop-image', cat: 'image', title: 'Crop Image', seoTitle: 'Crop Image Online Free - Free Photo Cropper Tool | ToolHero', desc: 'Crop images to custom aspect ratios (1:1, 16:9, 4:3) and exact pixel bounds.', keywords: 'crop image online, photo cropper free, image trimmer, toolhero', icon: Crop, component: CropImage },
  { id: 'convert-format', cat: 'image', title: 'Image Converter', seoTitle: 'Image Converter Online Free - Convert PNG to JPG & WebP | ToolHero', desc: 'Convert between PNG, JPG, WebP, and AVIF image formats in batch.', keywords: 'image format converter, png to jpg online, webp to png free, toolhero', icon: ArrowRightLeft, component: ConvertFormat },
  { id: 'rotate-flip', cat: 'image', title: 'Rotate & Flip Image', seoTitle: 'Rotate & Flip Image Online Free - Mirror Photo Tool | ToolHero', desc: 'Rotate photos 90°/180° or mirror flip horizontally and vertically.', keywords: 'rotate image online, flip photo horizontally, mirror image free, toolhero', icon: RefreshCw, component: RotateFlipImage },
  { id: 'favicon-generator', cat: 'image', title: 'Favicon Generator', seoTitle: 'Favicon Generator Online Free - Generate ICO & PNG Favicons | ToolHero', desc: 'Generate all website favicon sizes (16x16, 32x32, 180x180) from any logo or photo.', keywords: 'favicon generator online, create ico file, website favicon maker, toolhero', icon: Image, component: FaviconGenerator },
  { id: 'remove-bg', cat: 'image', title: 'Remove Background', seoTitle: 'Remove Background from Image Free - Transparent BG Creator | ToolHero', desc: 'Automatically remove image backgrounds and export transparent PNGs.', keywords: 'remove background free, transparent background maker, bg eraser online, toolhero', icon: Sparkles, component: RemoveBgImage },
  { id: 'watermark-image', cat: 'image', title: 'Watermark Image', seoTitle: 'Watermark Image Online Free - Add Text & Logo Watermark | ToolHero', desc: 'Protect photos by adding custom text or logo watermarks over your images.', keywords: 'watermark image online, add text to photo, photo copyright watermark, toolhero', icon: Type, component: WatermarkImage },
  { id: 'blur-image', cat: 'image', title: 'Blur Image', seoTitle: 'Blur & Censor Photo Online Free - Hide Sensitive Text | ToolHero', desc: 'Blur photos and censor sensitive areas, faces, license plates, and private text.', keywords: 'blur image online, photo censor tool, hide sensitive info photo, toolhero', icon: EyeOff, component: BlurImage },
  { id: 'meme-generator', cat: 'image', title: 'Meme Generator', seoTitle: 'Meme Generator Online Free - Create Funny Memes | ToolHero', desc: 'Create funny memes with classic top and bottom text overlay on any picture.', keywords: 'meme generator online, create custom memes, photo text meme, toolhero', icon: Smile, component: MemeGenerator },
  { id: 'color-palette', cat: 'image', title: 'Color Palette Generator', seoTitle: 'Color Palette Extractor - Extract Hex Colors from Image | ToolHero', desc: 'Extract dominant color palettes, RGB values, and Hex codes from any image.', keywords: 'color palette extractor, get hex code from image, color scheme generator, toolhero', icon: Palette, component: ColorPalette },

  // Text & Dev Tools (4 Tools)
  { id: 'word-counter', cat: 'text', title: 'Word Counter', seoTitle: 'Word Counter Online Free - Count Words, Characters & Reading Time | ToolHero', desc: 'Count words, characters, sentences, paragraphs, reading time & keyword frequency.', keywords: 'word counter online, character counter free, sentence counter tool, toolhero', icon: AlignLeft, component: WordCounter },
  { id: 'password-generator', cat: 'text', title: 'Password Generator', seoTitle: 'Password Generator Online Free - Random Strong Passwords | ToolHero', desc: 'Generate strong, uncrackable random passwords with custom symbols and length.', keywords: 'password generator online, random strong password, secure password maker, toolhero', icon: Key, component: PasswordGenerator },
  { id: 'diff-checker', cat: 'text', title: 'Text Diff Checker', seoTitle: 'Text Diff Checker Online Free - Compare Two Text Files | ToolHero', desc: 'Compare two text blocks line-by-line to highlight additions, deletions, and differences.', keywords: 'text diff checker, compare text online, diff tool free, toolhero', icon: DiffIcon, component: DiffChecker },
  { id: 'case-converter', cat: 'text', title: 'Case Converter', seoTitle: 'Case Converter Online Free - Convert UPPERCASE, camelCase | ToolHero', desc: 'Convert text between UPPERCASE, lowercase, Title Case, camelCase, snake_case, and kebab-case.', keywords: 'case converter online, uppercase to lowercase, camelcase converter, toolhero', icon: Type, component: CaseConverter },

  // Security & Crypto Tools (6 Tools)
  { id: 'hash-identifier', cat: 'security', title: 'Hash Identifier', seoTitle: 'Hash Identifier Online Free - Identify MD5, SHA256 & Hashes | ToolHero', desc: 'Identify unknown hash types: MD5, SHA-1, SHA-256, SHA-512, Bcrypt, and NTLM.', keywords: 'hash identifier online, identify md5 sha256, hash lookup free, toolhero', icon: Search, component: HashIdentifier },
  { id: 'crypto-studio', cat: 'security', title: 'Encryption / Decryption', seoTitle: 'Encryption Decryption Online Free - AES-256 Encrypt & Decrypt Text | ToolHero', desc: 'Encrypt & decrypt text with AES-256. Supports Base64 & Hex output formats.', keywords: 'encryption decryption online, encrypt text online free, aes 256 encrypt decrypt, text encryptor decoder, toolhero', icon: Lock, component: CryptoStudio },
  { id: 'password-analyzer', cat: 'security', title: 'Password Strength Checker', seoTitle: 'Password Strength Checker - Check Entropy & Crack Time | ToolHero', desc: 'Audit password entropy, estimate brute-force crack time, and check security strength.', keywords: 'password strength checker, password entropy calculator, crack time estimator, toolhero', icon: ShieldCheck, component: PasswordAnalyzer },
  { id: 'jwt-decoder', cat: 'security', title: 'JWT Decoder', seoTitle: 'JWT Decoder Online Free - Decode & Inspect JSON Web Tokens | ToolHero', desc: 'Decode JSON Web Token (JWT) headers, payload claims, signature, and expiration times.', keywords: 'jwt decoder online, decode json web token, inspect jwt claims, toolhero', icon: Code, component: JwtDecoder },
  { id: 'rsa-generator', cat: 'security', title: 'RSA Key Generator', seoTitle: 'RSA Key Generator Online Free - Generate 2048/4096 Key Pairs | ToolHero', desc: 'Generate RSA 2048-bit and 4096-bit public & private PEM key pairs instantly.', keywords: 'rsa key generator online, generate rsa public private key, pem key generator, toolhero', icon: Key, component: RsaGenerator },
  { id: 'ip-calculator', cat: 'security', title: 'IPv4 Subnet Calculator', seoTitle: 'IPv4 Subnet Calculator - CIDR Netmask & Host Range | ToolHero', desc: 'Calculate CIDR netmasks, wildcard masks, network addresses, broadcast IP & host ranges.', keywords: 'ipv4 subnet calculator, cidr netmask calculator, IP host range free, toolhero', icon: Network, component: SubnetCalculator },

  // Audio & Video Tools (3 Tools)
  { id: 'audio-trimmer', cat: 'media', title: 'Audio Trimmer', seoTitle: 'Audio Trimmer Online Free - Cut MP3 & Audio Clips | ToolHero', desc: 'Trim MP3 & WAV audio files online with live waveform preview and audio cutter controls.', keywords: 'audio trimmer online, cut mp3 free, audio cutter tool, toolhero', icon: Music, component: AudioTrimmer },
  { id: 'video-to-gif', cat: 'media', title: 'Video to GIF', seoTitle: 'Video to GIF Converter Online Free - Convert MP4 to GIF | ToolHero', desc: 'Convert MP4 and WebM video clips into smooth animated GIFs.', keywords: 'video to gif converter, mp4 to gif online, animated gif maker, toolhero', icon: Film, component: VideoToGif },
  { id: 'extract-audio', cat: 'media', title: 'Extract Audio from Video', seoTitle: 'Extract Audio from Video Online Free - Convert MP4 to MP3 | ToolHero', desc: 'Extract MP3 & WAV audio tracks directly from MP4 and WebM video files.', keywords: 'extract audio from video, mp4 to mp3 converter, video audio extractor, toolhero', icon: Radio, component: ExtractAudio },

  // Other Tools (2 Tools)
  { id: 'qr-code', cat: 'other', title: 'QR Code Generator', seoTitle: 'QR Code Generator Free - Custom QR Codes with Logo & Frames | ToolHero', desc: 'Generate custom high-resolution QR codes with custom colors, frame designs, and logo.', keywords: 'qr code generator free, custom qr code with logo, qr code maker frames, toolhero', icon: QrCode, component: QrCodeStudio },
  { id: 'json-formatter', cat: 'other', title: 'JSON Formatter', seoTitle: 'JSON Formatter Online Free - Format JSON & TS Types | ToolHero', desc: 'Format, beautify, validate JSON syntax & automatically generate TypeScript interfaces.', keywords: 'json formatter online, json validator beautifier, json to typescript converter, toolhero', icon: Code, component: JsonStudio },
];

export function getToolsByCategory(catId) {
  return TOOLS.filter(t => t.cat === catId);
}

export function getToolById(toolId) {
  return TOOLS.find(t => t.id === toolId);
}

export function getCategoryById(catId) {
  return CATEGORIES.find(c => c.id === catId);
}
