import express from "express";
import multer from "multer";
import {
  createHealthRecord,
  getPatientRecords,
  getMyRecords,
  updateRecordSharing,
  getRecordStats,
  uploadDocuments
} from "../controllers/recordController.js";
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// Configure multer for file uploads (using memory storage for Cloudinary)
const storage = multer.memoryStorage(); // Store files in memory as buffers

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    }
  }
});

// Create new medical record
/**
 * @swagger
 * /records/create:
 *   post:
 *     summary: Create a new medical record
 *     tags: [Medical Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientDid:
 *                 type: string
 *                 description: Patient's decentralized identifier
 *               clinicDid:
 *                 type: string
 *                 description: Clinic's decentralized identifier
 *               doctorDid:
 *                 type: string
 *                 description: Doctor's decentralized identifier
 *               recordType:
 *                 type: string
 *                 enum: [consultation, diagnosis, treatment, prescription, lab_result, imaging]
 *                 description: Type of medical record
 *               diagnosis:
 *                 type: string
 *                 description: Medical diagnosis
 *               treatment:
 *                 type: string
 *                 description: Treatment provided or recommended
 *               medications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     dosage:
 *                       type: string
 *                     frequency:
 *                       type: string
 *                     duration:
 *                       type: string
 *                 description: Prescribed medications
 *               symptoms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Patient symptoms
 *               vitalSigns:
 *                 type: object
 *                 properties:
 *                   bloodPressure:
 *                     type: string
 *                   heartRate:
 *                     type: integer
 *                   temperature:
 *                     type: number
 *                   respiratoryRate:
 *                     type: integer
 *                   oxygenSaturation:
 *                     type: number
 *                 description: Patient vital signs
 *               labResults:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     testName:
 *                       type: string
 *                     result:
 *                       type: string
 *                     referenceRange:
 *                       type: string
 *                     abnormal:
 *                       type: boolean
 *                 description: Laboratory test results
 *               notes:
 *                 type: string
 *                 description: Additional clinical notes
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IPFS hashes of attached files
 *               followUpDate:
 *                 type: string
 *                 format: date
 *                 description: Scheduled follow-up date
 *               recordDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of the medical record
 *             required:
 *               - patientDid
 *               - clinicDid
 *               - doctorDid
 *               - recordType
 *               - recordDate
 *     responses:
 *       201:
 *         description: Medical record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 recordId:
 *                   type: string
 *                   description: Unique identifier for the created record
 *                 blockchainHash:
 *                   type: string
 *                   description: Blockchain transaction hash
 *                 ipfsHash:
 *                   type: string
 *                   description: IPFS hash where record data is stored
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: When the record was created
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Create new health record (doctors/clinics only - can include full record data)
router.post('/', authenticate, authorizeRoles('DOCTOR', 'NGO'), upload.array('attachments', 5), createHealthRecord);

/**
 * @swagger
 * /records/upload:
 *   post:
 *     summary: Upload documents to existing record or create document-only record
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Medical document files (up to 5 files, max 10MB each)
 *               recordId:
 *                 type: string
 *                 description: Optional - ID of existing record to add documents to
 *               title:
 *                 type: string
 *                 description: Title for the document record
 *               description:
 *                 type: string
 *                 description: Description of the uploaded documents
 *     responses:
 *       201:
 *         description: Documents uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 recordId:
 *                   type: string
 *                 uploadedFiles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       filename:
 *                         type: string
 *                       url:
 *                         type: string
 *                       size:
 *                         type: integer
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Upload documents to existing record or create document-only record (patients can use this)
router.post('/upload', authenticate, upload.array('files', 5), uploadDocuments);

/**
 * @swagger
 * /records/patient/{patientId}:
 *   get:
 *     summary: Get medical records for a specific patient
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient user ID
 *       - in: query
 *         name: recordType
 *         schema:
 *           type: string
 *           enum: [consultation, diagnosis, treatment, prescription, lab_result, imaging]
 *         description: Filter by record type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter records from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter records until this date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: Patient records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 records:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MedicalRecord'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - No access to this patient's records
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Patient not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Get patient records by ID
router.get('/patient/:patientId', authenticate, getPatientRecords);

/**
 * @swagger
 * /records/my:
 *   get:
 *     summary: Get my medical records (for authenticated patient)
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: recordType
 *         schema:
 *           type: string
 *           enum: [consultation, diagnosis, treatment, prescription, lab_result, imaging]
 *         description: Filter by record type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter records from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter records until this date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: My records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 records:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MedicalRecord'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Get my records (for patients)
router.get('/my', authenticate, getMyRecords);

/**
 * @swagger
 * /records/{recordId}/sharing:
 *   put:
 *     summary: Update medical record sharing settings
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *         description: Record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sharedWith:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to share the record with
 *               isPublic:
 *                 type: boolean
 *                 description: Whether the record is publicly accessible
 *               permissions:
 *                 type: object
 *                 properties:
 *                   canView:
 *                     type: boolean
 *                   canEdit:
 *                     type: boolean
 *                   canShare:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Sharing settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 record:
 *                   $ref: '#/components/schemas/MedicalRecord'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Not the record owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Update record sharing settings
router.put('/:recordId/sharing', authenticate, updateRecordSharing);

/**
 * @swagger
 * /records/stats:
 *   get:
 *     summary: Get medical records statistics
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter stats by patient ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics period
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics period
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalRecords:
 *                       type: integer
 *                     recordsByType:
 *                       type: object
 *                     recentRecords:
 *                       type: integer
 *                     sharedRecords:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Get record statistics
router.get('/stats', authenticate, getRecordStats);

export default router;
