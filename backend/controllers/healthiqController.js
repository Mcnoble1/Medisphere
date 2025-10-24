import { Conversation, HealthInsight, UserHealthProfile } from '../models/healthiqModel.js';
import HealthRecord from '../models/recordModel.js';
import { User } from '../models/userModel.js';
import { hcsLog } from '../utils/hcsLogger.js';
import createError from 'http-errors';

// AI Service Configuration
// This is a placeholder - you'll need to integrate with OpenAI, Anthropic Claude, or another AI service
const generateAIResponse = async (messages, userHealthContext) => {
  // TODO: Integrate with actual AI service (OpenAI, Anthropic, etc.)
  // For now, this is a sophisticated mock that demonstrates health-tailored responses

  const lastMessage = messages[messages.length - 1];
  const userMessage = lastMessage.content.toLowerCase();

  // Health-focused response generation
  let response = {
    content: '',
    confidence: 85,
    analysisType: 'general',
    healthRecordsAnalyzed: [],
    recommendations: []
  };

  // Analyze user's health records if available
  if (userHealthContext && userHealthContext.healthRecords && userHealthContext.healthRecords.length > 0) {
    response.healthRecordsAnalyzed = userHealthContext.healthRecords.slice(0, 5).map(r => r._id.toString());
  }

  // Pattern matching for health queries
  if (userMessage.includes('blood pressure') || userMessage.includes('bp')) {
    response.analysisType = 'cardiovascular';
    response.confidence = 88;

    if (userHealthContext?.vitalSigns?.bloodPressure?.systolic?.length > 0) {
      const recentReadings = userHealthContext.vitalSigns.bloodPressure.systolic.slice(-5);
      const avgSystolic = recentReadings.reduce((sum, r) => sum + r.value, 0) / recentReadings.length;

      response.content = `Based on your recent blood pressure readings, your average systolic pressure is ${avgSystolic.toFixed(0)} mmHg. `;

      if (avgSystolic > 130) {
        response.content += `This is slightly elevated. I recommend monitoring your sodium intake, increasing physical activity, and consulting with your healthcare provider. `;
        response.recommendations = [
          'Reduce sodium intake to <2300mg/day',
          'Engage in 30 minutes of moderate exercise daily',
          'Monitor blood pressure weekly',
          'Consider stress reduction techniques',
          'Schedule a consultation with your doctor'
        ];
      } else if (avgSystolic > 120) {
        response.content += `This is in the elevated range. Consider lifestyle modifications to prevent progression. `;
        response.recommendations = [
          'Maintain a balanced diet rich in fruits and vegetables',
          'Regular physical activity',
          'Limit alcohol consumption',
          'Maintain healthy weight'
        ];
      } else {
        response.content += `This is within normal range. Continue your healthy lifestyle habits. `;
        response.recommendations = [
          'Continue current lifestyle practices',
          'Monitor regularly for any changes',
          'Maintain balanced diet and exercise routine'
        ];
      }
    } else {
      response.content = `I'd be happy to help you understand your blood pressure. To provide personalized insights, please upload your recent blood pressure readings. Generally, normal blood pressure is below 120/80 mmHg. Would you like to know more about blood pressure management?`;
      response.recommendations = [
        'Upload recent blood pressure readings for personalized analysis',
        'Maintain a blood pressure log',
        'Consult your healthcare provider for baseline measurements'
      ];
    }
  } else if (userMessage.includes('diabetes') || userMessage.includes('glucose') || userMessage.includes('sugar')) {
    response.analysisType = 'diabetes';
    response.confidence = 87;
    response.content = `I can help you understand your glucose levels and diabetes risk. `;

    if (userHealthContext?.chronicConditions?.includes('diabetes')) {
      response.content += `I see you have diabetes in your health profile. Managing diabetes involves monitoring blood glucose, maintaining a healthy diet, regular exercise, and medication compliance. `;
      response.recommendations = [
        'Monitor blood glucose as recommended by your doctor',
        'Follow a low glycemic index diet',
        'Engage in regular physical activity',
        'Take medications as prescribed',
        'Attend regular check-ups',
        'Monitor for complications (foot care, eye exams)'
      ];
    } else {
      response.content += `Your health records don't show a diabetes diagnosis. Prevention is key - maintaining a healthy weight, balanced diet, and regular exercise can significantly reduce diabetes risk. `;
      response.recommendations = [
        'Maintain healthy BMI (18.5-24.9)',
        'Follow a balanced diet with limited refined sugars',
        'Exercise at least 150 minutes per week',
        'Get regular HbA1c screening if at risk',
        'Monitor for symptoms (excessive thirst, frequent urination, fatigue)'
      ];
    }
  } else if (userMessage.includes('headache') || userMessage.includes('fatigue') || userMessage.includes('tired')) {
    response.analysisType = 'general';
    response.confidence = 82;
    response.content = `Headaches and fatigue can have multiple causes. Let me analyze your health data for potential connections. `;

    if (userHealthContext?.lifestyle?.sleepHours?.length > 0) {
      const recentSleep = userHealthContext.lifestyle.sleepHours.slice(-7);
      const avgSleep = recentSleep.reduce((sum, r) => sum + r.value, 0) / recentSleep.length;

      if (avgSleep < 7) {
        response.content += `I notice your average sleep duration is ${avgSleep.toFixed(1)} hours per night, which is below the recommended 7-9 hours. Insufficient sleep is a common cause of both headaches and fatigue. `;
        response.recommendations = [
          'Aim for 7-9 hours of sleep per night',
          'Establish a consistent sleep schedule',
          'Create a relaxing bedtime routine',
          'Limit screen time before bed',
          'Ensure your bedroom is dark, quiet, and cool',
          'Stay hydrated throughout the day',
          'If symptoms persist, consult your healthcare provider'
        ];
      } else {
        response.content += `Your sleep patterns appear adequate. Other potential causes include dehydration, stress, eye strain, or underlying health conditions. `;
        response.recommendations = [
          'Ensure adequate hydration (8 glasses of water daily)',
          'Take regular breaks if working on screens',
          'Practice stress management techniques',
          'Monitor caffeine and alcohol intake',
          'Keep a symptom diary',
          'If symptoms persist or worsen, see your doctor'
        ];
      }
    } else {
      response.content += `Common causes include insufficient sleep, dehydration, stress, nutritional deficiencies, or underlying conditions. `;
      response.recommendations = [
        'Ensure 7-9 hours of quality sleep',
        'Stay well hydrated',
        'Eat balanced, regular meals',
        'Manage stress levels',
        'Take breaks and practice good posture',
        'Track symptoms in relation to activities',
        'Consult a healthcare provider if symptoms persist'
      ];
    }
  } else if (userMessage.includes('exercise') || userMessage.includes('fitness') || userMessage.includes('workout')) {
    response.analysisType = 'fitness';
    response.confidence = 90;

    if (userHealthContext?.lifestyle?.exerciseMinutes?.length > 0) {
      const recentExercise = userHealthContext.lifestyle.exerciseMinutes.slice(-7);
      const weeklyMinutes = recentExercise.reduce((sum, r) => sum + r.value, 0);

      response.content = `Based on your activity data, you're averaging ${weeklyMinutes} minutes of exercise per week. `;

      if (weeklyMinutes >= 150) {
        response.content += `Excellent! You're meeting the recommended guidelines of 150+ minutes per week. `;
        response.recommendations = [
          'Continue your great routine',
          'Consider adding strength training 2-3 times per week',
          'Vary your activities to prevent plateau',
          'Ensure adequate rest and recovery',
          'Stay hydrated and maintain proper nutrition'
        ];
      } else {
        response.content += `The recommended target is 150 minutes of moderate activity per week. `;
        response.recommendations = [
          'Gradually increase activity to reach 150 minutes per week',
          'Start with activities you enjoy',
          'Break exercise into smaller sessions if needed',
          'Include both cardio and strength training',
          'Track your progress',
          'Consult your doctor before starting a new exercise program'
        ];
      }
    } else {
      response.content = `Regular physical activity is crucial for overall health. Adults should aim for at least 150 minutes of moderate-intensity aerobic activity per week, plus strength training twice weekly. `;
      response.recommendations = [
        'Start tracking your exercise activity',
        'Begin with 30 minutes of moderate activity most days',
        'Choose activities you enjoy (walking, swimming, cycling)',
        'Include strength training exercises',
        'Gradually increase intensity and duration',
        'Consult your healthcare provider before starting a new program'
      ];
    }
  } else if (userMessage.includes('weight') || userMessage.includes('bmi')) {
    response.analysisType = 'nutrition';
    response.confidence = 85;

    if (userHealthContext?.vitalSigns?.weight?.length > 0 && userHealthContext?.vitalSigns?.height?.value) {
      const latestWeight = userHealthContext.vitalSigns.weight[userHealthContext.vitalSigns.weight.length - 1];
      const height = userHealthContext.vitalSigns.height.value;
      const bmi = latestWeight.value / ((height / 100) ** 2);

      response.content = `Your current BMI is approximately ${bmi.toFixed(1)}. `;

      if (bmi < 18.5) {
        response.content += `This is considered underweight. `;
        response.recommendations = [
          'Consult a healthcare provider or nutritionist',
          'Focus on nutrient-dense, calorie-rich foods',
          'Eat frequent, smaller meals',
          'Include healthy fats and proteins',
          'Rule out underlying health conditions'
        ];
      } else if (bmi < 25) {
        response.content += `This is within the healthy range. `;
        response.recommendations = [
          'Maintain current healthy habits',
          'Continue balanced nutrition',
          'Stay physically active',
          'Monitor weight regularly'
        ];
      } else if (bmi < 30) {
        response.content += `This is in the overweight range. `;
        response.recommendations = [
          'Aim for gradual, sustainable weight loss (1-2 lbs per week)',
          'Focus on balanced, portion-controlled meals',
          'Increase physical activity',
          'Reduce processed foods and added sugars',
          'Consider working with a nutritionist',
          'Stay hydrated and get adequate sleep'
        ];
      } else {
        response.content += `This is in the obese range, which may increase health risks. `;
        response.recommendations = [
          'Consult your healthcare provider for a comprehensive plan',
          'Work with a registered dietitian',
          'Start with small, sustainable changes',
          'Increase physical activity gradually',
          'Address any underlying health conditions',
          'Consider joining a support group',
          'Focus on overall health, not just weight'
        ];
      }
    } else {
      response.content = `To provide personalized weight management advice, I need your height and weight measurements. BMI is calculated as weight (kg) / height (m)². A healthy BMI range is typically 18.5-24.9. `;
      response.recommendations = [
        'Upload your height and weight for personalized analysis',
        'Maintain a balanced diet',
        'Stay physically active',
        'Monitor portion sizes',
        'Consult a healthcare provider for personalized guidance'
      ];
    }
  } else if (userMessage.includes('sleep') || userMessage.includes('insomnia')) {
    response.analysisType = 'sleep';
    response.confidence = 86;

    if (userHealthContext?.lifestyle?.sleepHours?.length > 0) {
      const recentSleep = userHealthContext.lifestyle.sleepHours.slice(-14);
      const avgSleep = recentSleep.reduce((sum, r) => sum + r.value, 0) / recentSleep.length;

      response.content = `Your average sleep duration over the past two weeks is ${avgSleep.toFixed(1)} hours per night. `;

      if (avgSleep < 6) {
        response.content += `This is significantly below the recommended 7-9 hours and may impact your health. `;
        response.recommendations = [
          'Prioritize sleep by setting a consistent bedtime',
          'Create a sleep-conducive environment (dark, quiet, cool)',
          'Establish a relaxing bedtime routine',
          'Limit caffeine after 2 PM',
          'Avoid screens 1 hour before bed',
          'Exercise regularly but not close to bedtime',
          'If issues persist, consult a sleep specialist'
        ];
      } else if (avgSleep < 7) {
        response.content += `This is slightly below optimal. Most adults need 7-9 hours. `;
        response.recommendations = [
          'Aim to increase sleep duration to 7-8 hours',
          'Maintain consistent sleep and wake times',
          'Optimize your sleep environment',
          'Practice good sleep hygiene',
          'Limit alcohol and heavy meals before bed'
        ];
      } else if (avgSleep <= 9) {
        response.content += `This is within the healthy range for most adults. `;
        response.recommendations = [
          'Continue maintaining good sleep habits',
          'Keep consistent sleep schedule',
          'Monitor sleep quality, not just duration',
          'Address any issues with sleep interruptions'
        ];
      } else {
        response.content += `This is longer than typical. Excessive sleep may sometimes indicate underlying issues. `;
        response.recommendations = [
          'Monitor for signs of sleep disorders',
          'Ensure sleep is restful, not just long',
          'Rule out depression or other health conditions',
          'Consult a healthcare provider if concerned'
        ];
      }
    } else {
      response.content = `Good sleep is essential for health. Adults typically need 7-9 hours of quality sleep per night. `;
      response.recommendations = [
        'Track your sleep patterns',
        'Establish a consistent sleep schedule',
        'Create a bedtime routine',
        'Optimize your sleep environment',
        'Limit screen time before bed',
        'Manage stress and anxiety',
        'Consult a doctor for persistent sleep issues'
      ];
    }
  } else if (userMessage.includes('medication') || userMessage.includes('prescription')) {
    response.analysisType = 'general';
    response.confidence = 90;

    if (userHealthContext?.medications?.length > 0) {
      const activeMeds = userHealthContext.medications.filter(m => m.ongoing);
      response.content = `I see you have ${activeMeds.length} active medication(s) in your profile. `;
      response.recommendations = [
        'Take all medications exactly as prescribed',
        'Set reminders to ensure consistent timing',
        'Don\'t skip doses',
        'Store medications properly',
        'Be aware of potential side effects',
        'Inform all healthcare providers about your medications',
        'Never share medications with others',
        'Consult your pharmacist or doctor before taking new supplements'
      ];
    } else {
      response.content = `I don't see any medications listed in your profile. `;
      response.recommendations = [
        'Update your health profile with current medications',
        'Include over-the-counter medications and supplements',
        'Keep an updated medication list for healthcare visits',
        'Always consult a healthcare provider before starting new medications'
      ];
    }
  } else if (userMessage.includes('stress') || userMessage.includes('anxiety') || userMessage.includes('mental health')) {
    response.analysisType = 'mental-health';
    response.confidence = 83;
    response.content = `Mental health is as important as physical health. Chronic stress and anxiety can impact your overall wellbeing and physical health. `;
    response.recommendations = [
      'Practice stress-reduction techniques (deep breathing, meditation)',
      'Maintain regular physical activity',
      'Ensure adequate sleep',
      'Stay connected with friends and family',
      'Consider mindfulness or yoga',
      'Limit caffeine and alcohol',
      'Set realistic goals and priorities',
      'Seek professional help if symptoms persist or worsen',
      'Remember: seeking help is a sign of strength'
    ];
  } else if (userMessage.includes('diet') || userMessage.includes('nutrition') || userMessage.includes('food')) {
    response.analysisType = 'nutrition';
    response.confidence = 87;
    response.content = `Nutrition plays a vital role in overall health and disease prevention. A balanced diet should include a variety of nutrients. `;
    response.recommendations = [
      'Eat a variety of colorful fruits and vegetables daily',
      'Choose whole grains over refined grains',
      'Include lean proteins (fish, poultry, legumes, nuts)',
      'Limit saturated fats and trans fats',
      'Reduce added sugars and sodium',
      'Stay well hydrated (8 glasses of water daily)',
      'Practice portion control',
      'Limit processed and ultra-processed foods',
      'Consider consulting a registered dietitian for personalized advice'
    ];
  } else {
    // General health assistant response
    response.content = `I'm your AI health assistant, designed to help you understand your health data and provide evidence-based guidance. I can help you with questions about blood pressure, diabetes, fitness, nutrition, sleep, mental health, and more.

I analyze your health records to provide personalized insights, but remember that I'm not a replacement for professional medical advice. Always consult with your healthcare provider for medical concerns.

How can I help you today? You can ask me about:
- Your vital signs and health trends
- Specific symptoms or concerns
- Lifestyle recommendations (exercise, diet, sleep)
- Understanding your health conditions
- Preventive health measures`;

    response.recommendations = [
      'Upload your health data for personalized insights',
      'Ask specific questions about your health concerns',
      'Regular check-ups with your healthcare provider',
      'Maintain a healthy lifestyle (balanced diet, exercise, adequate sleep)',
      'Stay informed about your health conditions'
    ];
  }

  // Add disclaimer to all responses
  response.content += `\n\n*Note: This is AI-generated guidance based on general health information${response.healthRecordsAnalyzed.length > 0 ? ' and your health records' : ''}. Always consult your healthcare provider for medical advice, diagnosis, or treatment.*`;

  return response;
};

// @desc    Send a message to the AI health assistant
// @route   POST /api/healthiq/chat
// @access  Private
export const sendChatMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { message, conversationId } = req.body;

    if (!message || !message.trim()) {
      throw createError(400, 'Message is required');
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, userId });
      if (!conversation) {
        throw createError(404, 'Conversation not found');
      }
    } else {
      // Create new conversation
      conversation = new Conversation({
        userId,
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        messages: []
      });
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    });

    // Get user health context
    const userHealthProfile = await UserHealthProfile.findOne({ userId });
    const healthRecords = await HealthRecord.find({ patient: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const healthContext = {
      vitalSigns: userHealthProfile?.vitalSigns,
      lifestyle: userHealthProfile?.lifestyle,
      chronicConditions: userHealthProfile?.chronicConditions,
      allergies: userHealthProfile?.allergies,
      medications: userHealthProfile?.medications,
      healthRecords
    };

    // Generate AI response
    const aiResponse = await generateAIResponse(conversation.messages, healthContext);

    // Add AI message
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse.content,
      timestamp: new Date(),
      metadata: {
        confidence: aiResponse.confidence,
        analysisType: aiResponse.analysisType,
        healthRecordsAnalyzed: aiResponse.healthRecordsAnalyzed,
        recommendations: aiResponse.recommendations
      }
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Log to HCS
    await hcsLog(req.hederaClient, 'HEALTHIQ_CHAT', userId, {
      conversationId: conversation._id,
      messageLength: message.length,
      aiConfidence: aiResponse.confidence
    });

    res.json({
      success: true,
      conversationId: conversation._id,
      message: conversation.messages[conversation.messages.length - 1]
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get chat conversations
// @route   GET /api/healthiq/conversations
// @access  Private
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 20, skip = 0, isActive = true } = req.query;

    const query = { userId };
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const conversations = await Conversation.find(query)
      .sort({ lastMessageAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('title lastMessageAt isActive createdAt messages')
      .lean();

    // Return conversations with preview of last message
    const conversationsWithPreview = conversations.map(conv => ({
      _id: conv._id,
      title: conv.title,
      lastMessageAt: conv.lastMessageAt,
      isActive: conv.isActive,
      createdAt: conv.createdAt,
      messageCount: conv.messages.length,
      lastMessage: conv.messages.length > 0
        ? {
            role: conv.messages[conv.messages.length - 1].role,
            content: conv.messages[conv.messages.length - 1].content.substring(0, 100),
            timestamp: conv.messages[conv.messages.length - 1].timestamp
          }
        : null
    }));

    res.json({
      success: true,
      conversations: conversationsWithPreview,
      total: await Conversation.countDocuments(query)
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get a specific conversation with all messages
// @route   GET /api/healthiq/conversations/:id
// @access  Private
export const getConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const conversation = await Conversation.findOne({ _id: id, userId });

    if (!conversation) {
      throw createError(404, 'Conversation not found');
    }

    res.json({
      success: true,
      conversation
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Delete a conversation
// @route   DELETE /api/healthiq/conversations/:id
// @access  Private
export const deleteConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const conversation = await Conversation.findOneAndDelete({ _id: id, userId });

    if (!conversation) {
      throw createError(404, 'Conversation not found');
    }

    await hcsLog(req.hederaClient, 'HEALTHIQ_CONVERSATION_DELETED', userId, {
      conversationId: id
    });

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Upload health data
// @route   POST /api/healthiq/health-data
// @access  Private
export const uploadHealthData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      bloodPressure,
      heartRate,
      weight,
      height,
      sleepHours,
      exerciseMinutes,
      symptoms,
      temperature,
      oxygenSaturation
    } = req.body;

    // Get or create user health profile
    let profile = await UserHealthProfile.findOne({ userId });

    if (!profile) {
      profile = new UserHealthProfile({
        userId,
        vitalSigns: {},
        lifestyle: {}
      });
    }

    const now = new Date();

    // Update vital signs
    if (bloodPressure) {
      const [systolic, diastolic] = bloodPressure.split('/').map(v => parseInt(v.trim()));
      if (systolic && diastolic) {
        if (!profile.vitalSigns.bloodPressure) {
          profile.vitalSigns.bloodPressure = { systolic: [], diastolic: [] };
        }
        profile.vitalSigns.bloodPressure.systolic.push({ value: systolic, date: now });
        profile.vitalSigns.bloodPressure.diastolic.push({ value: diastolic, date: now });

        // Keep only last 100 readings
        if (profile.vitalSigns.bloodPressure.systolic.length > 100) {
          profile.vitalSigns.bloodPressure.systolic = profile.vitalSigns.bloodPressure.systolic.slice(-100);
          profile.vitalSigns.bloodPressure.diastolic = profile.vitalSigns.bloodPressure.diastolic.slice(-100);
        }
      }
    }

    if (heartRate) {
      if (!profile.vitalSigns.heartRate) profile.vitalSigns.heartRate = [];
      profile.vitalSigns.heartRate.push({ value: parseInt(heartRate), date: now });
      if (profile.vitalSigns.heartRate.length > 100) {
        profile.vitalSigns.heartRate = profile.vitalSigns.heartRate.slice(-100);
      }
    }

    if (weight) {
      const weightValue = parseFloat(weight);
      if (!profile.vitalSigns.weight) profile.vitalSigns.weight = [];
      profile.vitalSigns.weight.push({ value: weightValue, unit: 'kg', date: now });
      if (profile.vitalSigns.weight.length > 100) {
        profile.vitalSigns.weight = profile.vitalSigns.weight.slice(-100);
      }

      // Calculate BMI if height is available
      if (height || profile.vitalSigns.height?.value) {
        const heightValue = height ? parseFloat(height) : profile.vitalSigns.height.value;
        const bmi = weightValue / ((heightValue / 100) ** 2);
        if (!profile.vitalSigns.bmi) profile.vitalSigns.bmi = [];
        profile.vitalSigns.bmi.push({ value: bmi, date: now });
        if (profile.vitalSigns.bmi.length > 100) {
          profile.vitalSigns.bmi = profile.vitalSigns.bmi.slice(-100);
        }
      }
    }

    if (height) {
      profile.vitalSigns.height = { value: parseFloat(height), unit: 'cm' };
    }

    if (temperature) {
      if (!profile.vitalSigns.temperature) profile.vitalSigns.temperature = [];
      profile.vitalSigns.temperature.push({ value: parseFloat(temperature), unit: 'C', date: now });
      if (profile.vitalSigns.temperature.length > 100) {
        profile.vitalSigns.temperature = profile.vitalSigns.temperature.slice(-100);
      }
    }

    if (oxygenSaturation) {
      if (!profile.vitalSigns.oxygenSaturation) profile.vitalSigns.oxygenSaturation = [];
      profile.vitalSigns.oxygenSaturation.push({ value: parseInt(oxygenSaturation), date: now });
      if (profile.vitalSigns.oxygenSaturation.length > 100) {
        profile.vitalSigns.oxygenSaturation = profile.vitalSigns.oxygenSaturation.slice(-100);
      }
    }

    // Update lifestyle data
    if (sleepHours) {
      if (!profile.lifestyle.sleepHours) profile.lifestyle.sleepHours = [];
      profile.lifestyle.sleepHours.push({ value: parseFloat(sleepHours), date: now });
      if (profile.lifestyle.sleepHours.length > 100) {
        profile.lifestyle.sleepHours = profile.lifestyle.sleepHours.slice(-100);
      }
    }

    if (exerciseMinutes) {
      if (!profile.lifestyle.exerciseMinutes) profile.lifestyle.exerciseMinutes = [];
      profile.lifestyle.exerciseMinutes.push({ value: parseInt(exerciseMinutes), date: now });
      if (profile.lifestyle.exerciseMinutes.length > 100) {
        profile.lifestyle.exerciseMinutes = profile.lifestyle.exerciseMinutes.slice(-100);
      }
    }

    // Add symptoms
    if (symptoms) {
      if (!profile.symptoms) profile.symptoms = [];
      profile.symptoms.push({
        description: symptoms,
        severity: 5, // Default medium severity
        date: now,
        resolved: false
      });
    }

    await profile.save();

    await hcsLog(req.hederaClient, 'HEALTHIQ_DATA_UPLOADED', userId, {
      dataTypes: Object.keys(req.body)
    });

    res.json({
      success: true,
      message: 'Health data uploaded successfully',
      profile: {
        vitalSigns: profile.vitalSigns,
        lifestyle: profile.lifestyle
      }
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get user health profile
// @route   GET /api/healthiq/health-profile
// @access  Private
export const getHealthProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const profile = await UserHealthProfile.findOne({ userId });

    if (!profile) {
      return res.json({
        success: true,
        profile: null,
        message: 'No health profile found. Upload health data to get started.'
      });
    }

    res.json({
      success: true,
      profile
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Generate health insights
// @route   POST /api/healthiq/generate-insights
// @access  Private
export const generateHealthInsights = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user health data
    const profile = await UserHealthProfile.findOne({ userId });
    const healthRecords = await HealthRecord.find({ patient: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    if (!profile && healthRecords.length === 0) {
      throw createError(400, 'No health data available. Please upload health data first.');
    }

    const insights = [];

    // Generate cardiovascular insight
    if (profile?.vitalSigns?.bloodPressure?.systolic?.length > 0) {
      const recentBP = profile.vitalSigns.bloodPressure.systolic.slice(-10);
      const avgSystolic = recentBP.reduce((sum, r) => sum + r.value, 0) / recentBP.length;

      let riskLevel = 'low';
      let description = 'Your blood pressure is within normal range.';
      let recommendations = ['Continue healthy lifestyle', 'Monitor regularly'];

      if (avgSystolic >= 140) {
        riskLevel = 'moderate-high';
        description = 'Your blood pressure is elevated and may require medical attention.';
        recommendations = [
          'Consult your doctor immediately',
          'Reduce sodium intake',
          'Increase physical activity',
          'Manage stress levels',
          'Monitor daily'
        ];
      } else if (avgSystolic >= 130) {
        riskLevel = 'low-moderate';
        description = 'Your blood pressure is slightly elevated.';
        recommendations = [
          'Reduce sodium to <2300mg/day',
          'Exercise 30 minutes daily',
          'Maintain healthy weight',
          'Limit alcohol',
          'Monitor weekly'
        ];
      }

      insights.push({
        userId,
        insightType: 'cardiovascular',
        title: 'Cardiovascular Risk Assessment',
        description,
        riskLevel,
        confidence: 88,
        recommendations,
        dataPoints: {
          vitalSigns: { avgSystolic: avgSystolic.toFixed(0) }
        }
      });
    }

    // Save insights
    for (const insightData of insights) {
      const insight = new HealthInsight(insightData);
      await insight.save();
    }

    // Update profile analysis timestamp
    if (profile) {
      profile.lastAnalyzedAt = new Date();
      await profile.save();
    }

    await hcsLog(req.hederaClient, 'HEALTHIQ_INSIGHTS_GENERATED', userId, {
      insightCount: insights.length
    });

    res.json({
      success: true,
      insights,
      message: `Generated ${insights.length} health insight(s)`
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get health insights
// @route   GET /api/healthiq/insights
// @access  Private
export const getHealthInsights = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { insightType, limit = 10 } = req.query;

    const query = { userId };
    if (insightType) {
      query.insightType = insightType;
    }

    const insights = await HealthInsight.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      insights
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Mark insight as viewed
// @route   PUT /api/healthiq/insights/:id/view
// @access  Private
export const markInsightViewed = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const insight = await HealthInsight.findOneAndUpdate(
      { _id: id, userId },
      { isViewed: true },
      { new: true }
    );

    if (!insight) {
      throw createError(404, 'Insight not found');
    }

    res.json({
      success: true,
      insight
    });

  } catch (err) {
    next(err);
  }
};
