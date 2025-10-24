import express from 'express';
import multer from 'multer';
import {
  createAppointment,
  listAppointments,
  acceptAppointment,
  cancelAppointment,
  issuePrescription,
  getPrescription,
  listPrescriptions,
  listDoctors,
  createMedicalRecordWithDocuments
} from '../controllers/medflowController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Configure multer for file uploads (using memory storage for Cloudinary)
const storage = multer.memoryStorage(); // Store files in memory as buffers

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
  fileFilter: (req, file, cb) => {
    // Accept images, PDFs, and documents
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, and DOCX are allowed.'));
    }
  }
});

// Doctors endpoint
router.get('/doctors', authMiddleware, listDoctors);

/**
 * @swagger
 * /medflow/appointments:
 *   post:
 *     summary: Create a new medical appointment
 *     tags: [MedFlow]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: string
 *                 description: Patient's DID
 *               providerId:
 *                 type: string
 *                 description: Healthcare provider's DID
 *               appointmentDate:
 *                 type: string
 *                 format: date-time
 *                 description: Scheduled appointment date and time
 *               duration:
 *                 type: integer
 *                 description: Appointment duration in minutes
 *               type:
 *                 type: string
 *                 enum: [consultation, follow_up, emergency, routine_checkup]
 *                 description: Type of appointment
 *               reason:
 *                 type: string
 *                 description: Reason for the appointment
 *               location:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [in_person, virtual]
 *                   address:
 *                     type: string
 *                   room:
 *                     type: string
 *                   meetingUrl:
 *                     type: string
 *               metadata:
 *                 type: object
 *                 description: Additional appointment information
 *             required:
 *               - patientId
 *               - providerId
 *               - appointmentDate
 *               - duration
 *               - type
 *               - reason
 *               - location
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appointmentId:
 *                   type: string
 *                   description: Unique appointment identifier
 *                 status:
 *                   type: string
 *                   enum: [scheduled, confirmed, cancelled, completed]
 *                   description: Current appointment status
 *                 blockHash:
 *                   type: string
 *                   description: Blockchain transaction hash
 *                 createdAt:
 *                   type: string
 *                   format: date-time
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
// Appointments
router.post('/appointments', authMiddleware, createAppointment);
/**
 * @swagger
 * /medflow/appointments:
 *   get:
 *     summary: List medical appointments
 *     tags: [MedFlow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter by patient's DID
 *       - in: query
 *         name: providerId
 *         schema:
 *           type: string
 *         description: Filter by provider's DID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, confirmed, cancelled, completed]
 *         description: Filter by appointment status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter appointments from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter appointments until this date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of appointments to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of appointments to skip
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appointments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       appointmentId:
 *                         type: string
 *                       patientId:
 *                         type: string
 *                       providerId:
 *                         type: string
 *                       appointmentDate:
 *                         type: string
 *                         format: date-time
 *                       duration:
 *                         type: integer
 *                       type:
 *                         type: string
 *                       reason:
 *                         type: string
 *                       status:
 *                         type: string
 *                       location:
 *                         type: object
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       lastUpdated:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
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
router.get('/appointments', authMiddleware, listAppointments);
/**
 * @swagger
 * /medflow/appointments/{id}/accept:
 *   patch:
 *     summary: Accept/confirm a medical appointment
 *     tags: [MedFlow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Optional notes about the acceptance
 *               confirmedBy:
 *                 type: string
 *                 description: DID of the person confirming the appointment
 *     responses:
 *       200:
 *         description: Appointment accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appointmentId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [confirmed]
 *                 confirmedBy:
 *                   type: string
 *                 confirmationDate:
 *                   type: string
 *                   format: date-time
 *                 blockHash:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Appointment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Appointment cannot be accepted in current state
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
router.patch('/appointments/:id/accept', authMiddleware, acceptAppointment);
/**
 * @swagger
 * /medflow/appointments/{id}/cancel:
 *   patch:
 *     summary: Cancel a medical appointment
 *     tags: [MedFlow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *               cancelledBy:
 *                 type: string
 *                 description: DID of the person cancelling the appointment
 *               notes:
 *                 type: string
 *                 description: Additional notes about the cancellation
 *             required:
 *               - reason
 *               - cancelledBy
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appointmentId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [cancelled]
 *                 cancelledBy:
 *                   type: string
 *                 cancellationDate:
 *                   type: string
 *                   format: date-time
 *                 reason:
 *                   type: string
 *                 blockHash:
 *                   type: string
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
 *       404:
 *         description: Appointment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Appointment cannot be cancelled in current state
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
router.patch('/appointments/:id/cancel', authMiddleware, cancelAppointment);

/**
 * @swagger
 * /medflow/prescriptions:
 *   post:
 *     summary: Issue a new medical prescription
 *     tags: [MedFlow]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: string
 *                 description: Patient's DID
 *               providerId:
 *                 type: string
 *                 description: Prescribing doctor's DID
 *               medications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     drugName:
 *                       type: string
 *                       description: Name of the medication
 *                     dosage:
 *                       type: string
 *                       description: Medication dosage
 *                     frequency:
 *                       type: string
 *                       description: How often to take the medication
 *                     duration:
 *                       type: string
 *                       description: How long to take the medication
 *                     quantity:
 *                       type: integer
 *                       description: Number of units prescribed
 *                     instructions:
 *                       type: string
 *                       description: Special instructions
 *                 description: List of prescribed medications
 *               diagnosis:
 *                 type: string
 *                 description: Medical diagnosis
 *               prescriptionDate:
 *                 type: string
 *                 format: date
 *                 description: Date of prescription
 *               validUntil:
 *                 type: string
 *                 format: date
 *                 description: Prescription expiration date
 *               notes:
 *                 type: string
 *                 description: Additional prescription notes
 *             required:
 *               - patientId
 *               - providerId
 *               - medications
 *               - diagnosis
 *               - prescriptionDate
 *               - validUntil
 *     responses:
 *       201:
 *         description: Prescription issued successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 prescriptionId:
 *                   type: string
 *                   description: Unique prescription identifier
 *                 prescriptionNumber:
 *                   type: string
 *                   description: Human-readable prescription number
 *                 qrCode:
 *                   type: string
 *                   description: QR code for prescription verification
 *                 blockHash:
 *                   type: string
 *                   description: Blockchain transaction hash
 *                 issuedAt:
 *                   type: string
 *                   format: date-time
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
// Prescriptions
router.post('/prescriptions', authMiddleware, issuePrescription);
router.get('/prescriptions', authMiddleware, listPrescriptions);
/**
 * @swagger
 * /medflow/prescriptions/{id}:
 *   get:
 *     summary: Get detailed information about a prescription
 *     tags: [MedFlow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prescription ID
 *     responses:
 *       200:
 *         description: Prescription details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 prescriptionId:
 *                   type: string
 *                 prescriptionNumber:
 *                   type: string
 *                 patientId:
 *                   type: string
 *                 providerId:
 *                   type: string
 *                 medications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       drugName:
 *                         type: string
 *                       dosage:
 *                         type: string
 *                       frequency:
 *                         type: string
 *                       duration:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       instructions:
 *                         type: string
 *                       dispensed:
 *                         type: boolean
 *                       dispensedDate:
 *                         type: string
 *                         format: date-time
 *                       pharmacyId:
 *                         type: string
 *                 diagnosis:
 *                   type: string
 *                 prescriptionDate:
 *                   type: string
 *                   format: date
 *                 validUntil:
 *                   type: string
 *                   format: date
 *                 status:
 *                   type: string
 *                   enum: [active, dispensed, expired, cancelled]
 *                 qrCode:
 *                   type: string
 *                 notes:
 *                   type: string
 *                 issuedAt:
 *                   type: string
 *                   format: date-time
 *                 blockHash:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Prescription not found
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
router.get('/prescriptions/:id', authMiddleware, getPrescription);

// Medical record creation with document upload (Doctor only)
router.post('/records/upload', authMiddleware, upload.array('documents', 10), createMedicalRecordWithDocuments);

export default router;
