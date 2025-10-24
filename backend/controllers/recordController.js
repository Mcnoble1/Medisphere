import HealthRecord from '../models/recordModel.js';
import { User } from '../models/userModel.js';
import { hcsLog } from '../utils/hcsLogger.js';
import { uploadToCloudinary } from '../utils/cloudinaryConfig.js';
import { uploadJsonToIPFS } from '../utils/ipfsClient.js';
import { getVaccinationNFTCollection, mintVaccinationNFT, transferNFTToPatient } from '../utils/nft.js';
import { createMedicalRecordVC } from '../utils/vc.js';
import createError from 'http-errors';

// @desc    Create a health record
// @route   POST /api/records
// @access  Private (Doctor/Clinic only)
export const createHealthRecord = async (req, res, next) => {
  try {
    const addedById = req.user.id;
    const {
      patientId,
      type,
      title,
      date,
      doctor,
      facility,
      notes,
      attachments,
      labData,
      prescriptionData,
      vaccinationData,
      surgeryData
    } = req.body;

    // Confirm sender has permission to create records
    const creator = await User.findById(addedById);
    if (!['DOCTOR', 'NGO'].includes(creator.role)) {
      throw createError(403, 'Only doctors and NGOs can create health records');
    }

    // Confirm patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'PATIENT') {
      throw createError(400, 'Invalid patient ID');
    }

    // Create type-specific data object
    const typeData = {};
    if (type === 'lab-result' && labData) typeData.labData = labData;
    if (type === 'prescription' && prescriptionData) typeData.prescriptionData = prescriptionData;
    if (type === 'vaccination' && vaccinationData) typeData.vaccinationData = vaccinationData;
    if (type === 'surgery' && surgeryData) typeData.surgeryData = surgeryData;

    // Prepare record metadata for IPFS
    const recordMetadata = {
      recordId: null, // Will be set after creation
      patient: patientId,
      type,
      title,
      date: date || new Date(),
      doctor,
      facility,
      notes,
      addedBy: addedById,
      addedByRole: creator.role.toLowerCase(),
      createdAt: new Date().toISOString(),
      ...typeData
    };

    // Create health record (without IPFS CID initially)
    const record = await HealthRecord.create({
      patient: patientId,
      clinic: creator._id,
      addedBy: addedById,
      type,
      title,
      date: date || new Date(),
      doctor,
      facility,
      notes,
      attachments: attachments || [],
      addedByRole: creator.role.toLowerCase(),
      canEdit: creator.role === 'DOCTOR',
      ...typeData
    });

    // Upload metadata to IPFS
    recordMetadata.recordId = record._id.toString();
    const ipfsResult = await uploadJsonToIPFS(recordMetadata, `health-record-${record._id}`);

    // Log to Hedera HCS with IPFS CID
    const hcsResult = await hcsLog(req.hederaClient, 'HEALTH_RECORD_CREATED', record._id.toString(), {
      patientId,
      type,
      title,
      addedBy: addedById,
      ipfsCid: ipfsResult.cid,
      ipfsUrl: ipfsResult.url
    });

    // Update record with IPFS and HCS information
    record.ipfsCid = ipfsResult.cid;
    record.ipfsUrl = ipfsResult.url;
    record.hcsHash = hcsResult.transactionId;
    record.hcsTopicId = hcsResult.topicId;
    record.blockchainHash = hcsResult.transactionId; // Legacy field

    // Handle NFT for vaccination records or VC for other types
    if (type === 'vaccination') {
      try {
        // Mint NFT for vaccination record
        const tokenId = await getVaccinationNFTCollection(creator._id.toString());
        const nftResult = await mintVaccinationNFT(
          creator._id.toString(),
          tokenId,
          ipfsResult.cid,
          {
            vaccine: vaccinationData?.vaccine,
            patient: `${patient.firstName} ${patient.lastName}`,
            recordId: record._id.toString()
          }
        );

        console.log(`[NFT] Vaccination record ${record._id} minted as NFT: ${nftResult.nftId}`);

        // Transfer NFT to patient
        try {
          const transferResult = await transferNFTToPatient(
            patientId,
            nftResult.tokenId,
            nftResult.serial
          );

          record.nftData = {
            tokenId: nftResult.tokenId,
            serial: nftResult.serial,
            nftId: nftResult.nftId,
            transactionId: nftResult.transactionId,
            transferTransactionId: transferResult.transferTransactionId,
            ownerAccountId: transferResult.recipientAccountId,
            transferred: true,
            funded: transferResult.funded
          };

          console.log(`[NFT] NFT ${nftResult.nftId} transferred to patient ${transferResult.recipientAccountId}`);
          if (transferResult.funded) {
            console.log(`[NFT] Patient account funded with 1000 HBAR for NFT operations`);
          }
        } catch (transferError) {
          console.error('[NFT] Failed to transfer NFT to patient (keeping in treasury):', transferError);

          // Store NFT data even if transfer fails (NFT stays in treasury)
          record.nftData = {
            tokenId: nftResult.tokenId,
            serial: nftResult.serial,
            nftId: nftResult.nftId,
            transactionId: nftResult.transactionId,
            transferred: false,
            transferError: transferError.message
          };
        }
      } catch (nftError) {
        console.error('[NFT] Failed to mint vaccination NFT (non-critical):', nftError);
        // Continue without NFT - record is still valid
      }
    } else {
      try {
        // Issue Verifiable Credential for non-vaccination records
        const vcResult = await createMedicalRecordVC({
          patientAccountId: patient.hederaAccountId || 'unknown',
          doctorAccountId: creator.hederaAccountId || 'unknown',
          recordType: type,
          recordData: {
            title,
            date,
            doctor,
            facility,
            notes
          },
          ipfsCid: ipfsResult.cid
        });

        record.vcData = {
          credentialId: vcResult.vc.id,
          vcJson: vcResult.vc,
          signature: vcResult.signature,
          issuerDid: vcResult.vc.issuer,
          subjectDid: vcResult.vc.credentialSubject.id
        };

        console.log(`[VC] Medical record ${record._id} issued as VC: ${vcResult.vc.id}`);
      } catch (vcError) {
        console.error('[VC] Failed to create verifiable credential (non-critical):', vcError);
        // Continue without VC - record is still valid
      }
    }

    await record.save();

    // Populate references for response
    await record.populate('patient', 'firstName lastName email');
    await record.populate('addedBy', 'firstName lastName email role');

    res.status(201).json({
      message: 'Health record created successfully',
      record
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get health records for a patient
// @route   GET /api/records/patient/:patientId
// @access  Private
export const getPatientRecords = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { type, limit = 50, offset = 0 } = req.query;

    // Build query
    const query = { patient: patientId };
    if (type && type !== 'all') {
      query.type = type;
    }

    // Get records with pagination
    const records = await HealthRecord.find(query)
      .populate('patient', 'firstName lastName email')
      .populate('addedBy', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await HealthRecord.countDocuments(query);

    res.json({
      records,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get my health records (for patients)
// @route   GET /api/records/my
// @access  Private (Patient only)
export const getMyRecords = async (req, res, next) => {
  try {
    const patientId = req.user.id;
    const { type, limit = 50, offset = 0 } = req.query;

    // Ensure user is a patient
    if (req.user.role !== 'PATIENT') {
      throw createError(403, 'This endpoint is for patients only');
    }

    // Build query
    const query = { patient: patientId };
    if (type && type !== 'all') {
      query.type = type;
    }

    const records = await HealthRecord.find(query)
      .populate('addedBy', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await HealthRecord.countDocuments(query);

    res.json({
      records,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Update health record sharing settings
// @route   PUT /api/records/:recordId/sharing
// @access  Private (Patient only)
export const updateRecordSharing = async (req, res, next) => {
  try {
    const { recordId } = req.params;
    const { isShared, consentRecipients } = req.body;
    const patientId = req.user.id;

    // Find the record and ensure it belongs to the patient
    const record = await HealthRecord.findOne({
      _id: recordId,
      patient: patientId
    });

    if (!record) {
      throw createError(404, 'Health record not found');
    }

    // Update sharing settings
    record.isShared = isShared;
    record.consentRecipients = consentRecipients || [];
    await record.save();

    // Log the sharing change
    await hcsLog(req.hederaClient, 'RECORD_SHARING_UPDATED', record._id.toString(), {
      patientId,
      isShared,
      recipientCount: consentRecipients?.length || 0,
    });

    res.json({
      message: 'Sharing settings updated successfully',
      record
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get record types statistics
// @route   GET /api/records/stats
// @access  Private
export const getRecordStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let query = {};

    // Adjust query based on user role
    if (req.user.role === 'PATIENT') {
      query.patient = userId;
    } else if (req.user.role === 'DOCTOR') {
      query.addedBy = userId;
    }

    const stats = await HealthRecord.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          latest: { $max: '$createdAt' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalRecords = await HealthRecord.countDocuments(query);

    res.json({
      totalRecords,
      byType: stats
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Upload health documents (for patients or add attachments to records)
// @route   POST /api/records/upload
// @access  Private (All authenticated users)
export const uploadDocuments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { recordId, type, title, date, doctor, facility, notes, patientId } = req.body;

    // Get uploaded files
    const files = req.files || [];
    if (files.length === 0) {
      throw createError(400, 'No files uploaded');
    }

    // Upload files to Cloudinary
    const attachments = [];
    for (const file of files) {
      try {
        const cloudinaryResult = await uploadToCloudinary(file.buffer, {
          filename: file.originalname,
          folder: 'medisphere/health-records',
          resourceType: 'auto',
          metadata: {
            patientId: recordId ? 'existing-record' : (patientId || userId),
            uploadedBy: userId,
            originalName: file.originalname
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
        throw createError(500, `File upload failed for ${file.originalname}`);
      }
    }

    let record;

    // If recordId is provided, add attachments to existing record
    if (recordId) {
      record = await HealthRecord.findById(recordId);
      if (!record) {
        throw createError(404, 'Health record not found');
      }

      // Check permissions: patient can only update their own records
      if (req.user.role === 'PATIENT' && record.patient.toString() !== userId) {
        throw createError(403, 'You can only add documents to your own records');
      }

      // Add new attachments to existing record
      record.attachments.push(...attachments);

      // Update IPFS with new attachments information
      const updatedMetadata = {
        recordId: record._id.toString(),
        attachmentsAdded: attachments.length,
        attachmentsList: attachments.map(a => ({ filename: a.filename, url: a.url })),
        updatedAt: new Date().toISOString(),
        updatedBy: userId
      };

      const ipfsResult = await uploadJsonToIPFS(updatedMetadata, `attachments-update-${record._id}-${Date.now()}`);

      // Log to Hedera HCS with IPFS CID
      const hcsResult = await hcsLog(req.hederaClient, 'DOCUMENTS_UPLOADED', record._id.toString(), {
        userId,
        fileCount: files.length,
        recordId,
        ipfsCid: ipfsResult.cid
      });

      // Update record with latest HCS hash
      if (!record.hcsHash) {
        record.hcsHash = hcsResult.transactionId;
        record.hcsTopicId = hcsResult.topicId;
      }

      await record.save();

    } else {
      // Create a new document-only record
      // Determine the actual patient
      let actualPatientId = userId; // Default to self for patients

      // For doctors/NGOs creating records, patientId is required
      if (['DOCTOR', 'NGO'].includes(req.user.role)) {
        if (!patientId) {
          throw createError(400, 'Patient ID is required for healthcare providers');
        }
        actualPatientId = patientId;

        // Verify patient exists
        const patient = await User.findById(actualPatientId);
        if (!patient || patient.role !== 'PATIENT') {
          throw createError(400, 'Invalid patient ID');
        }
      }

      // For patients, they can only create document records for themselves
      if (req.user.role === 'PATIENT') {
        actualPatientId = userId;
      }

      // Prepare record metadata for IPFS
      const recordMetadata = {
        recordId: null, // Will be set after creation
        patient: actualPatientId,
        type: type || 'other',
        title: title || 'Uploaded Documents',
        date: date || new Date(),
        doctor: doctor || 'Self-uploaded',
        facility: facility || 'Patient Upload',
        notes: notes || '',
        attachments: attachments.map(a => ({ filename: a.filename, url: a.url, size: a.size })),
        addedBy: userId,
        addedByRole: req.user.role.toLowerCase(),
        createdAt: new Date().toISOString()
      };

      // Create new record with documents
      record = await HealthRecord.create({
        patient: actualPatientId,
        clinic: req.user.role === 'PATIENT' ? actualPatientId : userId,
        addedBy: userId,
        type: type || 'other',
        title: title || 'Uploaded Documents',
        date: date || new Date(),
        doctor: doctor || 'Self-uploaded',
        facility: facility || 'Patient Upload',
        notes: notes || '',
        attachments,
        addedByRole: req.user.role.toLowerCase(),
        canEdit: req.user.role !== 'PATIENT'
      });

      // Upload metadata to IPFS
      recordMetadata.recordId = record._id.toString();
      const ipfsResult = await uploadJsonToIPFS(recordMetadata, `document-record-${record._id}`);

      // Log to Hedera HCS with IPFS CID
      const hcsResult = await hcsLog(req.hederaClient, 'DOCUMENT_RECORD_CREATED', record._id.toString(), {
        patientId: actualPatientId,
        uploadedBy: userId,
        fileCount: files.length,
        type: record.type,
        ipfsCid: ipfsResult.cid,
        ipfsUrl: ipfsResult.url
      });

      // Update record with IPFS and HCS information
      record.ipfsCid = ipfsResult.cid;
      record.ipfsUrl = ipfsResult.url;
      record.hcsHash = hcsResult.transactionId;
      record.hcsTopicId = hcsResult.topicId;
      record.blockchainHash = hcsResult.transactionId; // Legacy field
      await record.save();
    }

    // Populate references for response
    await record.populate('patient', 'firstName lastName email');
    await record.populate('addedBy', 'firstName lastName email role');

    res.status(201).json({
      message: 'Documents uploaded successfully',
      record
    });

  } catch (err) {
    next(err);
  }
};
