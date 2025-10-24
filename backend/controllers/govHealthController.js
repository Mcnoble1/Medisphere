// backend/controllers/govHealthController.js
import License from '../models/licenseModel.js';
import Audit from '../models/auditModel.js';
import { uploadJsonToIPFS } from '../utils/ipfsClient.js';
import { submitGovEvent } from '../utils/hederaGov.js';
import { fetchHcsMessagesByTopic } from '../utils/mirrorNode.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Issue a License
 * - Stores license in DB
 * - Uploads certificate (optional) to IPFS
 * - Logs issuance to HCS (submitGovEvent)
 */
export const issueLicense = async (req, res) => {
  try {
    const { issuedTo, issuedToType, issuedBy, validFrom, validUntil, complianceRequirements, certificateBlob } = req.body;

    // Validation
    if (!issuedTo || !issuedToType || !issuedBy || !validFrom || !validUntil) {
      return res.status(400).json({
        error: 'Missing required fields: issuedTo, issuedToType, issuedBy, validFrom, validUntil'
      });
    }

    // Validate issuedToType
    const validTypes = ['practitioner', 'facility', 'lab', 'pharmacy'];
    if (!validTypes.includes(issuedToType)) {
      return res.status(400).json({
        error: `Invalid issuedToType. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Validate dates
    const validFromDate = new Date(validFrom);
    const validUntilDate = new Date(validUntil);

    if (isNaN(validFromDate.getTime()) || isNaN(validUntilDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format for validFrom or validUntil' });
    }

    if (validUntilDate <= validFromDate) {
      return res.status(400).json({ error: 'validUntil must be after validFrom' });
    }

    // create unique license number
    const licenseNumber = `LIC-${Date.now()}-${Math.floor(Math.random()*10000)}`;

    let ipfsCid = null;
    if (certificateBlob) {
      try {
        // certificateBlob expected as base64 or raw string
        const result = await uploadJsonToIPFS({ certificate: certificateBlob }, `license-${licenseNumber}`);
        ipfsCid = result.cid;
      } catch (ipfsError) {
        console.error('IPFS upload error', ipfsError);
        // Continue without IPFS if upload fails
      }
    }

    const license = await License.create({
      licenseNumber,
      issuedTo,
      issuedToType,
      issuedBy,
      validFrom: validFromDate,
      validUntil: validUntilDate,
      complianceRequirements: complianceRequirements || [],
      ipfsCid,
    });

    // Prepare HCS log
    const event = {
      type: 'LICENSE_ISSUED',
      licenseNumber,
      licenseId: license._id.toString(),
      issuedTo,
      issuedToType,
      issuedBy,
      validFrom,
      validUntil,
      ipfsCid,
      timestamp: new Date().toISOString()
    };

    try {
      // Submit to HCS
      const hcsMessageId = await submitGovEvent(event);

      // Save HCS tx id
      license.hcsMessageId = hcsMessageId;
      await license.save();
    } catch (hcsError) {
      console.error('HCS submission error', hcsError);
      // License is still created, but without HCS reference
    }

    return res.status(201).json({ message: 'License issued successfully', license });
  } catch (err) {
    console.error('issueLicense error', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

/**
 * Revoke a license
 * - updates DB
 * - logs revoke to HCS
 */
export const revokeLicense = async (req, res) => {
  try {
    const { id } = req.params; // license _id
    const { revokedBy, reason } = req.body;

    // Validation
    if (!revokedBy || !reason) {
      return res.status(400).json({ error: 'Missing required fields: revokedBy, reason' });
    }

    const license = await License.findById(id);
    if (!license) {
      return res.status(404).json({ error: 'License not found' });
    }

    if (license.status === 'revoked') {
      return res.status(400).json({ error: 'License is already revoked' });
    }

    license.status = 'revoked';
    await license.save();

    const event = {
      type: 'LICENSE_REVOKED',
      licenseNumber: license.licenseNumber,
      licenseId: license._id.toString(),
      revokedBy,
      reason,
      timestamp: new Date().toISOString()
    };

    try {
      const hcsMessageId = await submitGovEvent(event);
      license.hcsMessageId = hcsMessageId;
      await license.save();
    } catch (hcsError) {
      console.error('HCS submission error', hcsError);
      // License is still revoked, but without HCS reference
    }

    return res.json({ message: 'License revoked successfully', license });
  } catch (err) {
    console.error('revokeLicense error', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

/**
 * Create an Audit
 * - stores audit record
 * - uploads audit report to IPFS (optional)
 * - logs audit event to HCS with CID
 */
export const createAudit = async (req, res) => {
  try {
    const { targetEntity, performedBy, summary, findings, severity, reportBlob, targetLicenseId } = req.body;

    // Validation
    if (!targetEntity || !performedBy || !summary || !severity) {
      return res.status(400).json({
        error: 'Missing required fields: targetEntity, performedBy, summary, severity'
      });
    }

    // Validate severity
    const validSeverities = ['low', 'medium', 'high'];
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({
        error: `Invalid severity. Must be one of: ${validSeverities.join(', ')}`
      });
    }

    // Validate targetLicenseId if provided
    if (targetLicenseId) {
      const licenseExists = await License.findById(targetLicenseId);
      if (!licenseExists) {
        return res.status(404).json({ error: 'Target license not found' });
      }
    }

    const auditId = `AUD-${uuidv4()}`;

    let ipfsReportCid = null;
    if (reportBlob) {
      try {
        const result = await uploadJsonToIPFS(Buffer.from(reportBlob, 'base64'), `audit-${auditId}`);
        ipfsReportCid = result.cid;
      } catch (ipfsError) {
        console.error('IPFS upload error', ipfsError);
        // Continue without IPFS if upload fails
      }
    }

    const audit = await Audit.create({
      auditId,
      targetLicense: targetLicenseId || undefined,
      targetEntity,
      performedBy,
      summary,
      findings: findings || [],
      severity,
      ipfsReportCid
    });

    // HCS log
    const event = {
      type: 'AUDIT_COMPLETED',
      auditId,
      auditDbId: audit._id.toString(),
      targetEntity,
      targetLicenseId,
      performedBy,
      ipfsReportCid,
      summary,
      findings: findings || [],
      severity,
      timestamp: new Date().toISOString()
    };

    try {
      const hcsMessageId = await submitGovEvent(event);
      audit.hcsMessageId = hcsMessageId;
      await audit.save();
    } catch (hcsError) {
      console.error('HCS submission error', hcsError);
      // Audit is still created, but without HCS reference
    }

    return res.status(201).json({ message: 'Audit recorded successfully', audit });
  } catch (err) {
    console.error('createAudit error', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

/**
 * List licenses (with basic filtering)
 */
export const listLicenses = async (req, res) => {
  try {
    const { status, issuedTo } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (issuedTo) filter.issuedTo = issuedTo;
    const licenses = await License.find(filter).sort({ createdAt: -1 }).limit(200);
    return res.json({ licenses });
  } catch (err) {
    console.error('listLicenses error', err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Get public health stats (example using Mirror Node HCS messages)
 */
export const publicHealthData = async (req, res) => {
  try {
    // example: read last 200 messages from gov HCS topic for aggregated events
    const topicId = process.env.HEDERA_TOPIC_ID_GOV || process.env.HEDERA_TOPIC_ID;
    const messages = await fetchHcsMessagesByTopic(topicId, 200);

    // For simplicity, parse messages and extract basic metrics
    const parsed = (messages.messages || []).map(m => {
      // message is base64 in mirror node response
      try {
        const payload = Buffer.from(m.message, 'base64').toString();
        return { consensusTimestamp: m.consensus_timestamp, message: JSON.parse(payload) };
      } catch (e) {
        return { consensusTimestamp: m.consensus_timestamp, messageRaw: m.message };
      }
    });

    // derive simple aggregate (counts by event.type)
    const counts = {};
    parsed.forEach(p => {
      const t = p.message && p.message.type ? p.message.type : 'unknown';
      counts[t] = (counts[t] || 0) + 1;
    });

    return res.json({ counts, messages: parsed.slice(0,50) });
  } catch (err) {
    console.error('publicHealthData error', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
};

/**
 * List audits
 */
export const listAudits = async (req, res) => {
  try {
    const { severity, targetEntity, performedBy } = req.query;
    const filter = {};
    if (severity) filter.severity = severity;
    if (targetEntity) filter.targetEntity = targetEntity;
    if (performedBy) filter.performedBy = performedBy;

    const audits = await Audit.find(filter)
      .populate('targetLicense')
      .sort({ auditDate: -1 })
      .limit(200);
    return res.json({ audits });
  } catch (err) {
    console.error('listAudits error', err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Get single license by ID
 */
export const getLicenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const license = await License.findById(id);
    if (!license) return res.status(404).json({ error: 'License not found' });
    return res.json({ license });
  } catch (err) {
    console.error('getLicenseById error', err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Get single audit by ID
 */
export const getAuditById = async (req, res) => {
  try {
    const { id } = req.params;
    const audit = await Audit.findById(id).populate('targetLicense');
    if (!audit) return res.status(404).json({ error: 'Audit not found' });
    return res.json({ audit });
  } catch (err) {
    console.error('getAuditById error', err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Update license status (for renewals, suspensions, etc.)
 */
export const updateLicenseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, updatedBy, reason } = req.body;

    // Validation
    if (!status || !updatedBy) {
      return res.status(400).json({ error: 'Missing required fields: status, updatedBy' });
    }

    // Validate status
    const validStatuses = ['active', 'revoked', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const license = await License.findById(id);
    if (!license) {
      return res.status(404).json({ error: 'License not found' });
    }

    if (license.status === status) {
      return res.status(400).json({ error: `License is already in ${status} status` });
    }

    const oldStatus = license.status;
    license.status = status;
    await license.save();

    // Log status change to HCS
    const event = {
      type: 'LICENSE_STATUS_UPDATED',
      licenseNumber: license.licenseNumber,
      licenseId: license._id.toString(),
      oldStatus,
      newStatus: status,
      updatedBy,
      reason: reason || 'Status update',
      timestamp: new Date().toISOString()
    };

    try {
      const hcsMessageId = await submitGovEvent(event);
      license.hcsMessageId = hcsMessageId;
      await license.save();
    } catch (hcsError) {
      console.error('HCS submission error', hcsError);
      // License status is still updated, but without HCS reference
    }

    return res.json({ message: 'License status updated successfully', license });
  } catch (err) {
    console.error('updateLicenseStatus error', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

/**
 * Get compliance statistics
 */
export const getComplianceStats = async (req, res) => {
  try {
    const totalLicenses = await License.countDocuments();
    const activeLicenses = await License.countDocuments({ status: 'active' });
    const expiredLicenses = await License.countDocuments({ status: 'expired' });
    const revokedLicenses = await License.countDocuments({ status: 'revoked' });

    const totalAudits = await Audit.countDocuments();
    const highSeverityAudits = await Audit.countDocuments({ severity: 'high' });
    const mediumSeverityAudits = await Audit.countDocuments({ severity: 'medium' });
    const lowSeverityAudits = await Audit.countDocuments({ severity: 'low' });

    // Licenses expiring soon (within 30 days)
    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + 30);
    const expiringSoon = await License.countDocuments({
      status: 'active',
      validUntil: { $lte: expiringDate, $gte: new Date() }
    });

    return res.json({
      licenses: {
        total: totalLicenses,
        active: activeLicenses,
        expired: expiredLicenses,
        revoked: revokedLicenses,
        expiringSoon
      },
      audits: {
        total: totalAudits,
        highSeverity: highSeverityAudits,
        mediumSeverity: mediumSeverityAudits,
        lowSeverity: lowSeverityAudits
      },
      complianceScore: totalLicenses > 0 ? Math.round((activeLicenses / totalLicenses) * 100) : 0
    });
  } catch (err) {
    console.error('getComplianceStats error', err);
    return res.status(500).json({ error: err.message });
  }
};
