import Joi from 'joi';

const patientDataSchema = Joi.object({
  age: Joi.number().min(0).max(150).optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  insuranceNumber: Joi.string().trim().optional(),
  emergencyContact: Joi.string().trim().optional(),
  bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').optional(),
  allergies: Joi.array().items(Joi.string().trim()).optional(),
  chronicConditions: Joi.array().items(Joi.string().trim()).optional()
});

const doctorDataSchema = Joi.object({
  medicalPractice: Joi.string().trim().optional(),
  medicalLicenseNumber: Joi.string().trim().optional(),
  specialty: Joi.string().trim().optional(),
  organization: Joi.string().trim().optional(),
  licenseNumber: Joi.string().trim().optional(),
  yearsOfExperience: Joi.number().min(0).optional(),
  verificationStatus: Joi.string().valid('pending', 'verified', 'rejected').default('pending')
});

const ngoDataSchema = Joi.object({
  organizationName: Joi.string().trim().optional(),
  registrationNumber: Joi.string().trim().optional(),
  organizationType: Joi.string().trim().optional(),
  organization: Joi.string().trim().optional(),
  focusAreas: Joi.array().items(Joi.string().trim()).optional(),
  operatingCountries: Joi.array().items(Joi.string().trim()).optional(),
  verificationStatus: Joi.string().valid('pending', 'verified', 'rejected').default('pending')
});

const governmentDataSchema = Joi.object({
  agencyName: Joi.string().trim().optional(),
  officialId: Joi.string().trim().optional(),
  designation: Joi.string().trim().optional(),
  organization: Joi.string().trim().optional(),
  department: Joi.string().trim().optional(),
  jurisdiction: Joi.string().trim().optional(),
  verificationStatus: Joi.string().valid('pending', 'verified', 'rejected').default('pending')
});

const pharmaDataSchema = Joi.object({
  companyName: Joi.string().trim().optional(),
  businessRegNumber: Joi.string().trim().optional(),
  supplyChainRole: Joi.string().valid('Manufacturer', 'Distributor', 'Wholesaler', 'Retailer').optional(),
  organization: Joi.string().trim().optional(),
  licenseNumber: Joi.string().trim().optional(),
  operatingLicenses: Joi.array().items(Joi.string().trim()).optional(),
  verificationStatus: Joi.string().valid('pending', 'verified', 'rejected').default('pending')
});

export const registerSchema = Joi.object({
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  phoneNumber: Joi.string().trim().required(),
  country: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('PATIENT', 'DOCTOR', 'NGO', 'GOVERNMENT', 'PHARMA').required(),
  roleData: Joi.object({
    PATIENT: patientDataSchema,
    DOCTOR: doctorDataSchema,
    NGO: ngoDataSchema,
    GOVERNMENT: governmentDataSchema,
    PHARMA: pharmaDataSchema
  }).optional(),
  // Allow role-specific fields at top level for frontend compatibility
  organization: Joi.string().trim().allow('').optional(),
  licenseNumber: Joi.string().trim().allow('').optional(),
  specialty: Joi.string().trim().allow('').optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});