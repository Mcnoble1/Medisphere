import mongoose from 'mongoose';

const healthMetricSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  // Vital signs
  vitals: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
    },
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    bmi: Number,
    bloodSugar: Number,
    oxygenSaturation: Number,
  },
  // Lifestyle data
  lifestyle: {
    steps: Number,
    sleepHours: Number,
    exerciseMinutes: Number,
    waterIntake: Number, // in liters
    smokingStatus: {
      type: String,
      enum: ['never', 'former', 'current'],
    },
    alcoholConsumption: {
      type: String,
      enum: ['none', 'occasional', 'moderate', 'heavy'],
    },
  },
  // Medication adherence
  medications: [{
    name: String,
    prescribed: Boolean,
    taken: Boolean,
    time: Date,
    notes: String,
  }],
  // Symptoms tracking
  symptoms: [{
    name: String,
    severity: {
      type: Number,
      min: 1,
      max: 10,
    },
    duration: String,
    notes: String,
  }],
  // Mood and mental health
  mentalHealth: {
    mood: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
    },
    stressLevel: {
      type: Number,
      min: 1,
      max: 10,
    },
    anxietyLevel: {
      type: Number,
      min: 1,
      max: 10,
    },
    notes: String,
  },
  // Data source
  source: {
    type: String,
    enum: ['manual', 'wearable', 'clinic', 'lab'],
    default: 'manual',
  },
  deviceInfo: {
    device: String,
    model: String,
    accuracy: Number,
  },
  // Privacy settings
  isPrivate: {
    type: Boolean,
    default: true,
  },
  sharedWith: [String], // Array of user roles or specific user IDs
}, { timestamps: true });

const aggregatedHealthDataSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  // Aggregated metrics
  averages: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
    },
    heartRate: Number,
    weight: Number,
    bmi: Number,
    steps: Number,
    sleepHours: Number,
    exerciseMinutes: Number,
  },
  trends: {
    weightChange: Number,
    bmiChange: Number,
    bloodPressureTrend: String, // 'improving', 'stable', 'worsening'
    fitnessScore: Number,
  },
  risks: [{
    type: String,
    level: {
      type: String,
      enum: ['low', 'medium', 'high'],
    },
    description: String,
    recommendations: [String],
  }],
  // AI insights
  insights: [{
    category: String,
    message: String,
    confidence: Number,
    generatedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

// Indexes
healthMetricSchema.index({ patient: 1, date: -1 });
healthMetricSchema.index({ date: 1 });
aggregatedHealthDataSchema.index({ patient: 1, period: 1, startDate: -1 });

const HealthMetric = mongoose.model('HealthMetric', healthMetricSchema);
const AggregatedHealthData = mongoose.model('AggregatedHealthData', aggregatedHealthDataSchema);

export { HealthMetric, AggregatedHealthData };