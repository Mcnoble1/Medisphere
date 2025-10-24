import mongoose from 'mongoose';

// Chat Conversation Schema
const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    confidence: Number,
    analysisType: String,
    healthRecordsAnalyzed: [String], // Array of health record IDs
    recommendations: [String]
  }
}, { _id: true });

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'New Conversation'
  },
  messages: [chatMessageSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  // Privacy and logging
  hcsHash: {
    type: String,
    index: true
  }
}, { timestamps: true });

// Indexes for performance
conversationSchema.index({ userId: 1, lastMessageAt: -1 });
conversationSchema.index({ userId: 1, isActive: 1 });

// Health Insights Schema
const healthInsightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  insightType: {
    type: String,
    enum: [
      'cardiovascular',
      'diabetes',
      'mental-health',
      'nutrition',
      'fitness',
      'sleep',
      'general',
      'preventive'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['low', 'low-moderate', 'moderate', 'moderate-high', 'high'],
    default: 'low'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  recommendations: [{
    type: String
  }],
  dataPoints: {
    healthRecords: [String], // IDs of health records analyzed
    vitalSigns: mongoose.Schema.Types.Mixed,
    trends: mongoose.Schema.Types.Mixed
  },
  isViewed: {
    type: Boolean,
    default: false
  },
  validUntil: {
    type: Date
  },
  // Blockchain verification
  hcsHash: {
    type: String,
    index: true
  }
}, { timestamps: true });

// Indexes
healthInsightSchema.index({ userId: 1, createdAt: -1 });
healthInsightSchema.index({ userId: 1, insightType: 1 });
healthInsightSchema.index({ userId: 1, isViewed: 1 });

// User Health Profile Schema (for AI context)
const userHealthProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  // Aggregated health data for AI context
  vitalSigns: {
    bloodPressure: {
      systolic: [{ value: Number, date: Date }],
      diastolic: [{ value: Number, date: Date }]
    },
    heartRate: [{ value: Number, date: Date }],
    weight: [{ value: Number, unit: String, date: Date }],
    height: { value: Number, unit: String },
    bmi: [{ value: Number, date: Date }],
    temperature: [{ value: Number, unit: String, date: Date }],
    oxygenSaturation: [{ value: Number, date: Date }]
  },
  lifestyle: {
    sleepHours: [{ value: Number, date: Date }],
    exerciseMinutes: [{ value: Number, date: Date }],
    stepsPerDay: [{ value: Number, date: Date }],
    smokingStatus: String,
    alcoholConsumption: String,
    dietaryPreferences: [String]
  },
  symptoms: [{
    description: String,
    severity: { type: Number, min: 1, max: 10 },
    date: Date,
    resolved: Boolean
  }],
  medications: [{
    name: String,
    dosage: String,
    startDate: Date,
    endDate: Date,
    ongoing: Boolean
  }],
  // Medical history summary
  chronicConditions: [String],
  allergies: [String],
  familyHistory: [String],
  surgeries: [{
    procedure: String,
    date: Date
  }],
  // AI preferences
  aiPreferences: {
    analysisFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'as-needed'],
      default: 'as-needed'
    },
    insights: {
      type: [String],
      default: ['cardiovascular', 'diabetes', 'mental-health', 'general']
    },
    notificationsEnabled: {
      type: Boolean,
      default: true
    }
  },
  lastAnalyzedAt: {
    type: Date
  },
  // Privacy
  dataConsent: {
    aiAnalysis: { type: Boolean, default: true },
    anonymousResearch: { type: Boolean, default: false },
    shareWithProviders: { type: Boolean, default: true }
  }
}, { timestamps: true });

// Models
export const Conversation = mongoose.model('HealthIQConversation', conversationSchema);
export const HealthInsight = mongoose.model('HealthInsight', healthInsightSchema);
export const UserHealthProfile = mongoose.model('UserHealthProfile', userHealthProfileSchema);
