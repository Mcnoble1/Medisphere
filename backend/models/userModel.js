import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const RoleEnum = ['PATIENT', 'DOCTOR', 'NGO', 'GOVERNMENT', 'PHARMA', 'INSURER'];

const PatientSchema = new mongoose.Schema({
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other'], lowercase: true },
  insuranceNumber: { type: String, trim: true },
  emergencyContact: { type: String, trim: true },
  bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], trim: true },
  allergies: [{ type: String, trim: true }],
  chronicConditions: [{ type: String, trim: true }]
}, { _id: false });

const DoctorSchema = new mongoose.Schema({
  medicalPractice: { type: String, trim: true },
  medicalLicenseNumber: { type: String, trim: true },
  specialty: { type: String, trim: true },
  organization: { type: String, trim: true },
  licenseNumber: { type: String, trim: true },
  yearsOfExperience: { type: Number },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' }
}, { _id: false });

const NgoSchema = new mongoose.Schema({
  organizationName: { type: String, trim: true },
  registrationNumber: { type: String, trim: true },
  organizationType: { type: String, trim: true },
  organization: { type: String, trim: true },
  focusAreas: [{ type: String, trim: true }],
  operatingCountries: [{ type: String, trim: true }],
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' }
}, { _id: false });

const GovernmentSchema = new mongoose.Schema({
  agencyName: { type: String, trim: true },
  officialId: { type: String, trim: true },
  designation: { type: String, trim: true },
  organization: { type: String, trim: true },
  department: { type: String, trim: true },
  jurisdiction: { type: String, trim: true },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' }
}, { _id: false });

const PharmaSchema = new mongoose.Schema({
  companyName: { type: String, trim: true },
  businessRegNumber: { type: String, trim: true },
  supplyChainRole: { type: String, trim: true, enum: ['Manufacturer', 'Distributor', 'Wholesaler', 'Retailer'] },
  organization: { type: String, trim: true },
  licenseNumber: { type: String, trim: true },
  operatingLicenses: [{ type: String, trim: true }],
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' }
}, { _id: false });

const InsurerSchema = new mongoose.Schema({
  companyName: { type: String, trim: true },
  registrationNumber: { type: String, trim: true },
  insuranceType: { type: String, trim: true, enum: ['Health', 'Life', 'General', 'Comprehensive'] },
  organization: { type: String, trim: true },
  licenseNumber: { type: String, trim: true },
  coverageCountries: [{ type: String, trim: true }],
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' }
}, { _id: false });

const RoleDataSchema = new mongoose.Schema({
  PATIENT: PatientSchema,
  DOCTOR: DoctorSchema,
  NGO: NgoSchema,
  GOVERNMENT: GovernmentSchema,
  PHARMA: PharmaSchema,
  INSURER: InsurerSchema
}, { _id: false, minimize: false });

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true, unique: true, index: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, required: true, enum: RoleEnum },
  roleData: { type: RoleDataSchema, default: {} },
  // Hedera Account
  hederaAccountId: { type: String, unique: true, sparse: true },
  hederaPrivateKey: { type: String, select: false },
  // Audit metadata
  lastLoginAt: { type: Date }
}, { timestamps: true });

UserSchema.index({ phoneNumber: 1, country: 1 });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', UserSchema);









// -----------------------------
// File: README.md (setup notes)
// -----------------------------
// 1) npm i
// 2) copy .env.example -> .env and fill values
// 3) run: npm run dev
//
// Hedera Test Operator: create a testnet account & key at portal.hedera.com and paste into .env
//
// Swagger: GET http://localhost:4000/api/docs
//
// Notes:
// - All register/login/me actions are logged to Hedera Consensus Service via a dedicated Topic.
// - During startup, if HEDERA_LOG_TOPIC_ID is empty, a new Topic is created; its ID prints to console.
// - A DID is generated & published to the identity network on user registration; the DID string is saved on the user.
// - Defensive conversions to String() avoid `.startsWith` runtime errors from SDK expectations.
// - Role-specific fields are stored under `roleData` keyed by role.
