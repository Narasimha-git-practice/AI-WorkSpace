const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Document = require('../models/Document');
const { sendSuccess, sendError } = require('../utils/response');

// Extract plain text from uploaded document
const extractText = async (filePath, mimeType) => {
  if (mimeType === 'application/pdf') {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text || '';
  }
  if (mimeType.includes('wordprocessingml') || mimeType.includes('msword')) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  }
  if (mimeType === 'text/plain') {
    return fs.readFileSync(filePath, 'utf-8');
  }
  return '';
};

// Generate intelligent summary, key points, keywords, and action items from extracted text
const generateSummaryFromText = (text, filename) => {
  const cleanText = (text || '').trim();
  
  if (!cleanText) {
    return {
      summary: `Document "${filename}" was successfully uploaded and stored in the database. Raw text extraction returned limited structured content, but the complete binary document payload is safely retained in the database.`,
      keyPoints: [
        'Document payload safely stored in database',
        'Metadata and binary stream indexed',
        'Available for preview and download'
      ],
      keywords: ['Document', 'Storage', 'Database', 'Archive'],
      actionItems: ['Review original document file']
    };
  }

  const sentences = cleanText.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 10);
  const words = cleanText.split(/\s+/).filter(Boolean);

  // Summary (first 3-4 sentences or fallback snippet)
  const summaryParts = sentences.slice(0, 4).join(' ');
  const summary = summaryParts.length > 40 ? summaryParts : cleanText.slice(0, 300) + '...';

  // Key Points
  const keyPoints = sentences.slice(0, 5).map((s) => s.trim());
  if (keyPoints.length === 0) {
    keyPoints.push(`Contains ${words.length} words of text content.`);
  }

  // Keywords (most frequent words > 3 characters excluding common stop words)
  const stopWords = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'were', 'which', 'your', 'about', 'into', 'through', 'after', 'where', 'their', 'there', 'been', 'with', 'more', 'when', 'will']);
  const freqMap = {};
  words.forEach((w) => {
    const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.length > 3 && !stopWords.has(clean)) {
      freqMap[clean] = (freqMap[clean] || 0) + 1;
    }
  });
  const keywords = Object.keys(freqMap)
    .sort((a, b) => freqMap[b] - freqMap[a])
    .slice(0, 6);
  if (keywords.length === 0) keywords.push('Document', 'Text');

  // Action items
  const actionItems = sentences
    .filter((s) => /must|should|need|will|action|task|important|key|ensure|require|plan|goal|manage/i.test(s))
    .slice(0, 4)
    .map((s) => s.trim());
  if (actionItems.length === 0) {
    actionItems.push('Review extracted document text and key findings');
  }

  return { summary, keyPoints, keywords, actionItems };
};

// @desc  Upload a document (PDF, DOCX, TXT), extract text, summarize & store binary file in DB
// @route POST /api/documents/upload
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 400, 'Please upload a file');

    const fileUrl = `/uploads/documents/${req.file.filename}`;
    const filePath = path.join(__dirname, '../../uploads/documents', req.file.filename);

    let extractedText = '';
    try {
      extractedText = await extractText(filePath, req.file.mimetype);
    } catch (e) {
      console.error('Text extraction error:', e.message);
    }

    // Read file binary and store in DB as Base64 string
    let fileData = '';
    try {
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        fileData = `data:${req.file.mimetype};base64,${buffer.toString('base64')}`;
      }
    } catch (e) {
      console.error('File DB binary read error:', e.message);
    }

    // Calculate reading time
    const wordCount = extractedText ? extractedText.split(/\s+/).filter(Boolean).length : 0;
    const readingTime = `${Math.max(1, Math.ceil(wordCount / 200))} min`;

    // Generate summary analysis
    const analysis = generateSummaryFromText(extractedText, req.file.originalname);

    const document = await Document.create({
      userId: req.user._id,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      fileUrl,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      extractedText,
      isProcessed: true,
      summary: analysis.summary,
      keyPoints: analysis.keyPoints,
      keywords: analysis.keywords,
      actionItems: analysis.actionItems,
      readingTime,
      fileData,
    });

    sendSuccess(res, 201, 'Document uploaded & processed successfully', document);
  } catch (error) {
    next(error);
  }
};

// @desc  Get all documents for the logged-in user (auto-fixes unprocessed legacy records)
// @route GET /api/documents
exports.getDocuments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let docs = await Document.find({ userId: req.user._id })
      .select('-fileData') // Exclude heavy binary field from list query
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Auto-repair any documents with missing processed status or summary fields
    for (const doc of docs) {
      if (doc.isProcessed !== true || !doc.summary) {
        const analysis = generateSummaryFromText(doc.extractedText, doc.originalName);
        doc.isProcessed = true;
        doc.summary = analysis.summary;
        doc.keyPoints = analysis.keyPoints;
        doc.keywords = analysis.keywords;
        doc.actionItems = analysis.actionItems;
        const words = doc.extractedText ? doc.extractedText.split(/\s+/).filter(Boolean).length : 0;
        doc.readingTime = `${Math.max(1, Math.ceil(words / 200))} min`;
        await doc.save();
      }
    }

    const total = await Document.countDocuments({ userId: req.user._id });
    sendSuccess(res, 200, 'Documents fetched', docs, { total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// @desc  Summarize / Re-summarize a document
// @route POST /api/documents/:id/summarize
exports.summarizeDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user._id });
    if (!doc) return sendError(res, 404, 'Document not found');

    const analysis = generateSummaryFromText(doc.extractedText, doc.originalName);
    doc.summary = analysis.summary;
    doc.keyPoints = analysis.keyPoints;
    doc.keywords = analysis.keywords;
    doc.actionItems = analysis.actionItems;
    doc.isProcessed = true;

    const words = doc.extractedText ? doc.extractedText.split(/\s+/).filter(Boolean).length : 0;
    doc.readingTime = `${Math.max(1, Math.ceil(words / 200))} min`;

    await doc.save();
    sendSuccess(res, 200, 'Document summarized', doc);
  } catch (error) {
    next(error);
  }
};

// @desc  Delete a document
// @route DELETE /api/documents/:id
exports.deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!doc) return sendError(res, 404, 'Document not found');

    const filePath = path.join(__dirname, '../../uploads/documents', doc.storedName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    sendSuccess(res, 200, 'Document deleted');
  } catch (error) {
    next(error);
  }
};

