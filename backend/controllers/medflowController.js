// backend/controllers/medflowController.js
import Appointment from '../models/appointmentModel.js';
import Prescription from '../models/prescriptionModel.js';
import HealthRecord from '../models/recordModel.js';
import { User } from '../models/userModel.js';
import { encrypt, decrypt, signPayload, verifySignature } from '../utils/crypto.js';
import { hcsLog } from '../utils/hcsLogger.js';
import { uploadJsonToIPFS } from '../utils/ipfsClient.js';
import { uploadToCloudinary } from '../utils/cloudinaryConfig.js';
import path from 'path';

const KEYS_DIR = path.resolve('keys');

/** List available doctors/clinics */
export const listDoctors = async (req, res) => {
  try {
    const { specialty, search, limit = 50 } = req.query;
    const query = { role: 'DOCTOR' }; // Doctors are stored as 'DOCTOR' role

    // Add search filter if provided
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Add specialty filter if provided
    if (specialty && specialty !== 'all') {
      query['roleData.DOCTOR.specialty'] = specialty;
    }

    const doctors = await User.find(query)
      .select('firstName lastName email roleData hederaAccountId')
      .limit(parseInt(limit));

    // Transform to frontend format
    const formattedDoctors = doctors.map(doc => {
      const doctorData = doc.roleData?.DOCTOR || {};
      const fullName = `Dr. ${doc.firstName} ${doc.lastName}`;
      return {
        id: doc._id.toString(),
        name: fullName,
        specialty: doctorData.specialty || 'General Medicine',
        rating: 4.5, // Default rating (can be enhanced later with review system)
        experience: doctorData.yearsOfExperience || 5,
        location: doctorData.organization || 'Medical Center',
        phone: '+234 800 000 0000', // Default phone
        avatar: '/caring-doctor.png', // Default avatar
        availableSlots: ['09:00', '10:30', '14:00', '15:30'], // Default slots
        consultationFee: 15000, // Default fee in Naira
        languages: ['English'],
        education: doctorData.medicalPractice || 'Medical Degree',
        about: `Experienced ${doctorData.specialty || 'medical'} professional`,
        email: doc.email,
        hederaAccountId: doc.hederaAccountId
      };
    });

    res.json({ doctors: formattedDoctors });
  } catch (err) {
    console.error('listDoctors err', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/** Create appointment (patient) */
export const createAppointment = async (req, res) => {
  console.log('createAppointment req.body', req.body);
  try {
    const patientId = req.user._id; // filled by auth middleware
    const { clinicId, scheduledAt, reason } = req.body;

    const doctor = await User.findById(clinicId);
    if (!doctor || doctor.role !== 'DOCTOR') {
      return res.status(400).json({ error: 'Invalid doctor id' });
    }

    const appointment = await Appointment.create({
      patient: patientId,
      clinic: clinicId, // keeping field name for backward compatibility
      scheduledAt: new Date(scheduledAt),
      reason,
      status: 'requested'
    });

    // Log to Hedera HCS
    const hcsResult = await hcsLog(
      req.user._id.toString(),
      'appointment.created',
      req.user.email,
      {
        appointmentId: appointment._id.toString(),
        patientAccountId: req.user.hederaAccountId,
        doctorAccountId: doctor.hederaAccountId,
        scheduledAt: appointment.scheduledAt.toISOString()
      }
    );

    appointment.hcsMessageId = hcsResult.transactionId; // Use transactionId from hcsLog
    await appointment.save();

    res.status(201).json({ appointment });
  } catch (err) {
    console.error('createAppointment err', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/** List appointments (filter by user role) */
export const listAppointments = async (req, res) => {
  try {
    const user = req.user;
    const { status } = req.query;
    const q = {};
    if (user.role === 'PATIENT') q.patient = user._id;
    if (user.role === 'DOCTOR') q.clinic = user._id;
    if (status) q.status = status;

    const appointments = await Appointment.find(q)
      .populate('patient', 'firstName lastName email hederaAccountId')
      .populate('clinic', 'firstName lastName email hederaAccountId roleData')
      .sort({ scheduledAt: -1 });

    res.json({ appointments });
  } catch (err) {
    console.error('listAppointments err', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/** Doctor accepts appointment */
export const acceptAppointment = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'DOCTOR') {
      return res.status(403).json({ error: 'Only doctors can accept appointments' });
    }
    const appointmentId = req.params.id;
    const appt = await Appointment.findById(appointmentId).populate('patient clinic');
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    if (appt.clinic._id.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Not your appointment' });
    }

    appt.status = 'accepted';
    await appt.save();

    const hcsResult = await hcsLog(
      user._id.toString(),
      'appointment.accepted',
      user.email,
      {
        appointmentId: appt._id.toString(),
        doctorAccountId: user.hederaAccountId,
        patientAccountId: appt.patient.hederaAccountId
      }
    );
    appt.hcsMessageId = hcsResult.transactionId; // Use transactionId from hcsLog
    await appt.save();

    res.json({ appointment: appt });
  } catch (err) {
    console.error('acceptAppointment err', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/** Cancel appointment (patient or doctor) */
export const cancelAppointment = async (req, res) => {
  try {
    const user = req.user;
    const appointmentId = req.params.id;
    const appt = await Appointment.findById(appointmentId).populate('patient clinic');
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    const allowed = (user.role === 'DOCTOR' && appt.clinic._id.toString() === user._id.toString())
      || (user.role === 'PATIENT' && appt.patient._id.toString() === user._id.toString())
      || user.role === 'ADMIN';

    if (!allowed) return res.status(403).json({ error: 'Not allowed to cancel' });

    appt.status = 'cancelled';
    await appt.save();

    const hcsResult = await hcsLog(
      user._id.toString(),
      'appointment.cancelled',
      user.email,
      {
        appointmentId: appt._id.toString(),
        actorAccountId: user.hederaAccountId
      }
    );
    appt.hcsMessageId = hcsResult.transactionId; // Use transactionId from hcsLog
    await appt.save();

    res.json({ appointment: appt });
  } catch (err) {
    console.error('cancelAppointment err', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/** Doctor issues a prescription */
export const issuePrescription = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'DOCTOR') return res.status(403).json({ error: 'Only doctors can issue prescriptions' });

    const { appointmentId, title, payload } = req.body;
    const appt = await Appointment.findById(appointmentId).populate('patient clinic');
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    // Build prescription payload (structured)
    const pres = {
      title,
      medicines: payload.medicines || [],
      notes: payload.notes || '',
      issuedBy: { name: `${user.firstName} ${user.lastName}`, hederaAccountId: user.hederaAccountId },
      issuedTo: { name: `${appt.patient.firstName} ${appt.patient.lastName}`, hederaAccountId: appt.patient.hederaAccountId },
      appointmentId: appointmentId,
      issuedAt: new Date().toISOString()
    };

    // Encrypt payload
    const encryptedPayload = encrypt(JSON.stringify(pres));

    // Sign payload with doctor private key (if available)
    let signature = null;
    try {
      if (user.uuid) {
        const privateKeyPath = path.join(KEYS_DIR, `${user.uuid}.priv.pem`);
        signature = signPayload(privateKeyPath, pres);
      }
    } catch (signError) {
      console.warn('Signature generation skipped:', signError.message);
      // Continue without signature
    }

    // Upload prescription to IPFS
    let ipfsCid = null;
    let ipfsUrl = null;
    try {
      const ipfsData = {
        title,
        medicines: pres.medicines,
        notes: pres.notes,
        issuedBy: pres.issuedBy,
        issuedTo: pres.issuedTo,
        appointmentId: appointmentId,
        issuedAt: pres.issuedAt,
        encryptedPayload,
        signature
      };
      const ipfsResult = await uploadJsonToIPFS(ipfsData, `prescription-${appointmentId}`);
      ipfsCid = ipfsResult.cid;
      ipfsUrl = ipfsResult.url;
      console.log(`Prescription uploaded to IPFS: ${ipfsCid}`);
    } catch (ipfsError) {
      console.error('IPFS upload failed (non-critical):', ipfsError);
      // Continue even if IPFS upload fails
    }

    // Anchor issuance to HCS
    const hcsResult = await hcsLog(
      user._id.toString(),
      'prescription.issued',
      user.email,
      {
        appointmentId,
        prescriptionTitle: title,
        doctorAccountId: user.hederaAccountId,
        patientAccountId: appt.patient.hederaAccountId,
        ipfsCid: ipfsCid || 'N/A'
      }
    );
    const hcsMessageId = hcsResult.transactionId; // Use transactionId from hcsLog

    // Save prescription
    const prescription = await Prescription.create({
      appointment: appointmentId,
      patient: appt.patient._id,
      clinic: user._id,
      title,
      encryptedPayload,
      signature,
      hcsMessageId,
      ipfsCid,
      ipfsUrl
    });

    res.status(201).json({
      prescriptionId: prescription._id,
      hcsMessageId,
      ipfsCid: ipfsCid || null,
      ipfsUrl: ipfsUrl || null
    });
  } catch (err) {
    console.error('issuePrescription err', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/** Get prescription (decrypt if patient or doctor) */
export const getPrescription = async (req, res) => {
  try {
    const user = req.user;
    const id = req.params.id;
    const pres = await Prescription.findById(id).populate('patient clinic');
    if (!pres) return res.status(404).json({ error: 'Not found' });

    const isAllowed = (user.role === 'PATIENT' && pres.patient._id.toString() === user._id.toString())
      || (user.role === 'DOCTOR' && pres.clinic._id.toString() === user._id.toString())
      || user.role === 'ADMIN';

    if (!isAllowed) return res.status(403).json({ error: 'Access denied' });

    // Decrypt payload
    const decrypted = JSON.parse(decrypt(pres.encryptedPayload));

    // Verify signature (doctor public key if available)
    let signatureValid = false;
    try {
      if (pres.clinic.uuid && pres.signature) {
        const publicKeyPath = path.join(KEYS_DIR, `${pres.clinic.uuid}.pub.pem`);
        signatureValid = verifySignature(publicKeyPath, decrypted, pres.signature);
      }
    } catch (verifyError) {
      console.warn('Signature verification skipped:', verifyError.message);
    }

    return res.json({ prescription: decrypted, signatureValid });
  } catch (err) {
    console.error('getPrescription err', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/** List prescriptions (filter by user role) */
export const listPrescriptions = async (req, res) => {
  try {
    const user = req.user;
    const { status } = req.query;
    const q = {};

    // Filter based on user role
    if (user.role === 'PATIENT') {
      q.patient = user._id;
    } else if (user.role === 'DOCTOR') {
      q.clinic = user._id;
    }

    if (status) q.status = status;

    const prescriptions = await Prescription.find(q)
      .populate('patient', 'firstName lastName email hederaAccountId')
      .populate('clinic', 'firstName lastName email hederaAccountId')
      .populate('appointment')
      .sort({ createdAt: -1 });

    // Decrypt prescriptions for response
    const decryptedPrescriptions = prescriptions.map(pres => {
      try {
        const decrypted = JSON.parse(decrypt(pres.encryptedPayload));
        return {
          _id: pres._id,
          title: pres.title,
          patient: pres.patient,
          clinic: pres.clinic,
          appointment: pres.appointment,
          hcsMessageId: pres.hcsMessageId,
          issuedAt: pres.issuedAt,
          createdAt: pres.createdAt,
          updatedAt: pres.updatedAt,
          ...decrypted
        };
      } catch (err) {
        console.error('Error decrypting prescription:', err);
        return {
          _id: pres._id,
          title: pres.title,
          patient: pres.patient,
          clinic: pres.clinic,
          error: 'Decryption failed'
        };
      }
    });

    res.json({ prescriptions: decryptedPrescriptions });
  } catch (err) {
    console.error('listPrescriptions err', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/** Create medical record with document uploads (Doctor only) */
export const createMedicalRecordWithDocuments = async (req, res) => {
  try {
    const user = req.user;

    // Only doctors can create medical records via MedFlow
    if (user.role !== 'DOCTOR') {
      return res.status(403).json({ error: 'Only doctors can create medical records' });
    }

    const { patientId, type, title, date, doctor, facility, notes } = req.body;
    const files = req.files || [];

    // Validate required fields
    if (!patientId || !type || !title) {
      return res.status(400).json({ error: 'Patient ID, type, and title are required' });
    }

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'PATIENT') {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }

    // Upload files to Cloudinary if any
    const attachments = [];
    for (const file of files) {
      try {
        const cloudinaryResult = await uploadToCloudinary(file.buffer, {
          filename: file.originalname,
          folder: 'medisphere/medflow-records',
          resourceType: 'auto',
          metadata: {
            patientId: patientId,
            uploadedBy: user._id.toString(),
            originalName: file.originalname,
            recordType: type
          }
        });

        attachments.push({
          filename: file.originalname,
          url: cloudinaryResult.secure_url,
          publicId: cloudinaryResult.public_id,
          size: file.size,
          format: cloudinaryResult.format,
          resourceType: cloudinaryResult.resource_type,
          uploadedAt: new Date()
        });

        console.log(`[Cloudinary] Uploaded: ${file.originalname} -> ${cloudinaryResult.public_id}`);
      } catch (error) {
        console.error(`[Cloudinary] Upload failed for ${file.originalname}:`, error.message);
        return res.status(500).json({ error: `File upload failed for ${file.originalname}` });
      }
    }

    // Prepare record metadata for IPFS
    const recordMetadata = {
      recordId: null, // Will be set after creation
      patient: patientId,
      type,
      title,
      date: date || new Date(),
      doctor: doctor || `Dr. ${user.firstName} ${user.lastName}`,
      facility: facility || user.roleData?.DOCTOR?.organization || 'Medical Center',
      notes: notes || '',
      attachments: attachments.map(a => ({ filename: a.filename, url: a.url, size: a.size })),
      addedBy: user._id.toString(),
      addedByRole: 'doctor',
      createdAt: new Date().toISOString()
    };

    // Create health record
    const record = await HealthRecord.create({
      patient: patientId,
      clinic: user._id,
      addedBy: user._id,
      type,
      title,
      date: date || new Date(),
      doctor: doctor || `Dr. ${user.firstName} ${user.lastName}`,
      facility: facility || user.roleData?.DOCTOR?.organization || 'Medical Center',
      notes: notes || '',
      attachments,
      addedByRole: 'doctor',
      canEdit: true
    });

    // Upload metadata to IPFS
    recordMetadata.recordId = record._id.toString();
    const ipfsResult = await uploadJsonToIPFS(recordMetadata, `medflow-record-${record._id}`);

    // Log to Hedera HCS with IPFS CID
    const hcsResult = await hcsLog(
      user._id.toString(),
      'medflow.record.created',
      user.email,
      {
        recordId: record._id.toString(),
        patientId,
        type,
        title,
        doctorAccountId: user.hederaAccountId,
        patientAccountId: patient.hederaAccountId,
        fileCount: files.length,
        ipfsCid: ipfsResult.cid,
        ipfsUrl: ipfsResult.url
      }
    );

    // Update record with IPFS and HCS information
    record.ipfsCid = ipfsResult.cid;
    record.ipfsUrl = ipfsResult.url;
    record.hcsHash = hcsResult.transactionId;
    record.hcsTopicId = hcsResult.topicId;
    record.blockchainHash = hcsResult.transactionId; // Legacy field
    await record.save();

    // Populate references for response
    await record.populate('patient', 'firstName lastName email');
    await record.populate('addedBy', 'firstName lastName email role');

    res.status(201).json({
      message: 'Medical record created successfully',
      record
    });

  } catch (err) {
    console.error('createMedicalRecordWithDocuments err', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
