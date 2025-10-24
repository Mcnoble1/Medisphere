import express from 'express';
import {
  issueLicense,
  revokeLicense,
  createAudit,
  listLicenses,
  publicHealthData,
  listAudits,
  getLicenseById,
  getAuditById,
  updateLicenseStatus,
  getComplianceStats
} from '../controllers/govHealthController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /gov-health/licenses:
 *   post:
 *     summary: Issue a new healthcare license
 *     tags: [Government Health]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               applicantId:
 *                 type: string
 *                 description: DID of the license applicant
 *               licenseType:
 *                 type: string
 *                 enum: [medical_practice, pharmacy, laboratory, clinic, hospital]
 *                 description: Type of healthcare license
 *               applicantName:
 *                 type: string
 *                 description: Name of the applicant
 *               qualifications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     institution:
 *                       type: string
 *                     year:
 *                       type: integer
 *                     certificationNumber:
 *                       type: string
 *                 description: Applicant's qualifications and certifications
 *               specializations:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Areas of specialization
 *               validFrom:
 *                 type: string
 *                 format: date
 *                 description: License valid from date
 *               validUntil:
 *                 type: string
 *                 format: date
 *                 description: License expiration date
 *               conditions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Any conditions or restrictions on the license
 *               issuingAuthority:
 *                 type: string
 *                 description: Government authority issuing the license
 *             required:
 *               - applicantId
 *               - licenseType
 *               - applicantName
 *               - qualifications
 *               - validFrom
 *               - validUntil
 *               - issuingAuthority
 *     responses:
 *       201:
 *         description: License issued successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 licenseId:
 *                   type: string
 *                   description: Unique license identifier
 *                 licenseNumber:
 *                   type: string
 *                   description: Government-issued license number
 *                 status:
 *                   type: string
 *                   enum: [active, suspended, expired, revoked]
 *                 issuedAt:
 *                   type: string
 *                   format: date-time
 *                 blockHash:
 *                   type: string
 *                   description: Blockchain transaction hash
 *                 digitalCertificate:
 *                   type: string
 *                   description: Digital certificate for verification
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
 *         description: Forbidden - Insufficient privileges
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
// Protected route - only government officials can issue licenses
router.post('/licenses', authenticate, authorizeRoles('GOVERNMENT', 'ADMIN'), issueLicense);
/**
 * @swagger
 * /gov-health/licenses/{id}/revoke:
 *   put:
 *     summary: Revoke a healthcare license
 *     tags: [Government Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: License ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for license revocation
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *                 description: Date when revocation takes effect
 *               revokedBy:
 *                 type: string
 *                 description: Authority revoking the license
 *               appealProcess:
 *                 type: string
 *                 description: Information about appeal process
 *             required:
 *               - reason
 *               - effectiveDate
 *               - revokedBy
 *     responses:
 *       200:
 *         description: License revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 licenseId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [revoked]
 *                 revokedAt:
 *                   type: string
 *                   format: date-time
 *                 reason:
 *                   type: string
 *                 revokedBy:
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
 *       403:
 *         description: Forbidden - Insufficient privileges
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: License not found
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
// Protected route - only government officials can revoke licenses
router.put('/licenses/:id/revoke', authenticate, authorizeRoles('GOVERNMENT', 'ADMIN'), revokeLicense);
/**
 * @swagger
 * /gov-health/licenses:
 *   get:
 *     summary: List healthcare licenses
 *     tags: [Government Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: applicantId
 *         schema:
 *           type: string
 *         description: Filter by applicant's DID
 *       - in: query
 *         name: licenseType
 *         schema:
 *           type: string
 *           enum: [medical_practice, pharmacy, laboratory, clinic, hospital]
 *         description: Filter by license type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, suspended, expired, revoked]
 *         description: Filter by license status
 *       - in: query
 *         name: issuingAuthority
 *         schema:
 *           type: string
 *         description: Filter by issuing authority
 *       - in: query
 *         name: expiringBefore
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter licenses expiring before this date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of licenses to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of licenses to skip
 *     responses:
 *       200:
 *         description: Licenses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 licenses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       licenseId:
 *                         type: string
 *                       licenseNumber:
 *                         type: string
 *                       applicantId:
 *                         type: string
 *                       applicantName:
 *                         type: string
 *                       licenseType:
 *                         type: string
 *                       status:
 *                         type: string
 *                       validFrom:
 *                         type: string
 *                         format: date
 *                       validUntil:
 *                         type: string
 *                         format: date
 *                       issuingAuthority:
 *                         type: string
 *                       issuedAt:
 *                         type: string
 *                         format: date-time
 *                       specializations:
 *                         type: array
 *                         items:
 *                           type: string
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
 *       403:
 *         description: Forbidden - Insufficient privileges
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
// Public can view licenses, but authenticated users get more details
router.get('/licenses', listLicenses);
router.get('/licenses/:id', getLicenseById);
// Protected route - only government officials can update license status
router.put('/licenses/:id/status', authenticate, authorizeRoles('GOVERNMENT', 'ADMIN'), updateLicenseStatus);

/**
 * @swagger
 * /gov-health/audits:
 *   post:
 *     summary: Create a new healthcare audit
 *     tags: [Government Health]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetId:
 *                 type: string
 *                 description: DID of the entity being audited
 *               targetType:
 *                 type: string
 *                 enum: [provider, facility, pharmacy, laboratory, insurance_company]
 *                 description: Type of entity being audited
 *               auditType:
 *                 type: string
 *                 enum: [compliance, financial, quality, safety, license_renewal]
 *                 description: Type of audit being conducted
 *               scope:
 *                 type: object
 *                 properties:
 *                   areas:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Areas covered by the audit
 *                   dateRange:
 *                     type: object
 *                     properties:
 *                       startDate:
 *                         type: string
 *                         format: date
 *                       endDate:
 *                         type: string
 *                         format: date
 *                   departments:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Specific departments to audit
 *                 description: Scope of the audit
 *               scheduledDate:
 *                 type: string
 *                 format: date
 *                 description: Scheduled audit date
 *               auditorId:
 *                 type: string
 *                 description: DID of the lead auditor
 *               priority:
 *                 type: string
 *                 enum: [low, normal, high, urgent]
 *                 description: Priority level of the audit
 *               regulations:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Relevant regulations and standards
 *               notes:
 *                 type: string
 *                 description: Additional audit notes
 *             required:
 *               - targetId
 *               - targetType
 *               - auditType
 *               - scope
 *               - scheduledDate
 *               - auditorId
 *     responses:
 *       201:
 *         description: Audit created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 auditId:
 *                   type: string
 *                   description: Unique audit identifier
 *                 auditNumber:
 *                   type: string
 *                   description: Government audit reference number
 *                 status:
 *                   type: string
 *                   enum: [scheduled, in_progress, completed, cancelled]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
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
 *       403:
 *         description: Forbidden - Insufficient privileges
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
// Protected route - only government officials can create audits
router.post('/audits', authenticate, authorizeRoles('GOVERNMENT', 'ADMIN'), createAudit);
/**
 * @swagger
 * /gov-health/audits:
 *   get:
 *     summary: List healthcare audits
 *     tags: [Government Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: targetId
 *         schema:
 *           type: string
 *         description: Filter by target entity's DID
 *       - in: query
 *         name: targetType
 *         schema:
 *           type: string
 *           enum: [provider, facility, pharmacy, laboratory, insurance_company]
 *         description: Filter by target entity type
 *       - in: query
 *         name: auditType
 *         schema:
 *           type: string
 *           enum: [compliance, financial, quality, safety, license_renewal]
 *         description: Filter by audit type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, in_progress, completed, cancelled]
 *         description: Filter by audit status
 *       - in: query
 *         name: auditorId
 *         schema:
 *           type: string
 *         description: Filter by auditor's DID
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, normal, high, urgent]
 *         description: Filter by priority level
 *       - in: query
 *         name: scheduledAfter
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter audits scheduled after this date
 *       - in: query
 *         name: scheduledBefore
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter audits scheduled before this date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of audits to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of audits to skip
 *     responses:
 *       200:
 *         description: Audits retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 audits:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       auditId:
 *                         type: string
 *                       auditNumber:
 *                         type: string
 *                       targetId:
 *                         type: string
 *                       targetType:
 *                         type: string
 *                       auditType:
 *                         type: string
 *                       status:
 *                         type: string
 *                       scheduledDate:
 *                         type: string
 *                         format: date
 *                       auditorId:
 *                         type: string
 *                       priority:
 *                         type: string
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
 *       403:
 *         description: Forbidden - Insufficient privileges
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
// Protected routes - authenticated users can view audits
router.get('/audits', authenticate, listAudits);
router.get('/audits/:id', authenticate, getAuditById);

// Compliance statistics - accessible to all authenticated users
router.get('/stats/compliance', authenticate, getComplianceStats);

/**
 * @swagger
 * /gov-health/public-data:
 *   get:
 *     summary: Get aggregated public health data
 *     tags: [Government Health]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filter by geographical region
 *       - in: query
 *         name: dataType
 *         schema:
 *           type: string
 *           enum: [disease_statistics, vaccination_rates, facility_capacity, licensing_stats, audit_summary]
 *         description: Type of public health data to retrieve
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, quarterly, yearly]
 *           default: monthly
 *         description: Time aggregation period
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for data range
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for data range
 *       - in: query
 *         name: anonymized
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Whether to return anonymized data only
 *     responses:
 *       200:
 *         description: Public health data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     region:
 *                       type: string
 *                     dataType:
 *                       type: string
 *                     timeframe:
 *                       type: string
 *                     dateRange:
 *                       type: object
 *                       properties:
 *                         startDate:
 *                           type: string
 *                           format: date
 *                         endDate:
 *                           type: string
 *                           format: date
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *                     isAnonymized:
 *                       type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     diseaseStatistics:
 *                       type: object
 *                       properties:
 *                         totalCases:
 *                           type: integer
 *                         newCases:
 *                           type: integer
 *                         recoveries:
 *                           type: integer
 *                         byCategory:
 *                           type: object
 *                     vaccinationRates:
 *                       type: object
 *                       properties:
 *                         totalVaccinated:
 *                           type: integer
 *                         vaccinationRate:
 *                           type: number
 *                         byAgeGroup:
 *                           type: object
 *                         byRegion:
 *                           type: object
 *                     facilityCapacity:
 *                       type: object
 *                       properties:
 *                         totalFacilities:
 *                           type: integer
 *                         availableBeds:
 *                           type: integer
 *                         occupancyRate:
 *                           type: number
 *                         byType:
 *                           type: object
 *                     licensingStats:
 *                       type: object
 *                       properties:
 *                         activeLicenses:
 *                           type: integer
 *                         newLicenses:
 *                           type: integer
 *                         revokedLicenses:
 *                           type: integer
 *                         expiringLicenses:
 *                           type: integer
 *                         byType:
 *                           type: object
 *                     auditSummary:
 *                       type: object
 *                       properties:
 *                         totalAudits:
 *                           type: integer
 *                         completedAudits:
 *                           type: integer
 *                         complianceRate:
 *                           type: number
 *                         byType:
 *                           type: object
 *                 trends:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       period:
 *                         type: string
 *                       value:
 *                         type: number
 *                       change:
 *                         type: number
 *                       percentChange:
 *                         type: number
 *       400:
 *         description: Bad request
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
// public health aggregated data
router.get('/public-data', publicHealthData);

export default router;
