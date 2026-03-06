const mongoose = require('mongoose');
const User = require('./models/User');
const Trainer = require('./models/Trainer');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/letstrain');

const seed = async () => {
  try {
    // Clear existing
    await User.deleteMany();
    await Trainer.deleteMany();

    // Create users and trainers
    const trainersData = [
      {
        user: { name: 'Ahmed Khalil', email: 'ahmed@example.com', password: 'password', role: 'trainer', location: 'Beirut' },
        trainer: {
          portfolio: [
            'https://via.placeholder.com/300x200?text=Weight+Loss+Success+Story',
            'https://via.placeholder.com/300x200?text=Strength+Training+Session',
            'https://via.placeholder.com/300x200?text=Client+Transformation'
          ],
          bio: 'Certified personal trainer with 8 years of experience specializing in weight loss and strength training. I have helped over 200 clients achieve their fitness goals, with an average weight loss of 15kg per client. My personalized workout plans and nutritional guidance have transformed lives, boosting confidence and overall health. Clients love my motivational approach and attention to detail.',
          specialties: ['Weight Loss', 'Strength Training', 'Nutrition'],
          experience: 8,
          pricePerSession: 60,
          certificates: ['Certified Personal Trainer (CPT)', 'Nutrition Specialist', 'First Aid Certified'],
          profilePicture: 'https://via.placeholder.com/150x150?text=Ahmed+Khalil'
        }
      },
      {
        user: { name: 'Layla Mansour', email: 'layla@example.com', password: 'password', role: 'trainer', location: 'Beirut' },
        trainer: {
          portfolio: [
            'https://via.placeholder.com/300x200?text=Yoga+Sunrise+Class',
            'https://via.placeholder.com/300x200?text=Meditation+Session',
            'https://via.placeholder.com/300x200?text=Group+Wellness+Workshop'
          ],
          bio: 'Yoga instructor and wellness coach with 6 years of experience. I have guided 150+ students through transformative yoga journeys, helping them reduce stress by 70% and improve flexibility significantly. My holistic approach combines yoga, meditation, and mindfulness practices, suitable for all levels. Many clients report better sleep, reduced anxiety, and enhanced mental clarity after my sessions.',
          specialties: ['Yoga', 'Meditation', 'Wellness Coaching'],
          experience: 6,
          pricePerSession: 50,
          certificates: ['Registered Yoga Teacher (RYT-200)', 'Meditation Instructor', 'Holistic Health Coach'],
          profilePicture: 'https://via.placeholder.com/150x150?text=Layla+Mansour'
        }
      },
      {
        user: { name: 'Omar Saad', email: 'omar@example.com', password: 'password', role: 'trainer', location: 'Tripoli' },
        trainer: {
          portfolio: [
            'https://via.placeholder.com/300x200?text=Boxing+Championship+Prep',
            'https://via.placeholder.com/300x200?text=HIIT+Workout+Group',
            'https://via.placeholder.com/300x200?text=Athlete+Conditioning'
          ],
          bio: 'Former boxer turned fitness trainer with 10 years in the industry. I have trained 300+ athletes and fitness enthusiasts, improving endurance by 40% and building power through intense conditioning. My high-intensity interval training and combat sports programs have helped clients win competitions and achieve peak physical performance. Known for my disciplined approach and motivational coaching style.',
          specialties: ['Boxing', 'HIIT', 'Athletic Conditioning'],
          experience: 10,
          pricePerSession: 70,
          certificates: ['Boxing Coach Certification', 'Strength and Conditioning Specialist', 'Sports Nutrition'],
          profilePicture: 'https://via.placeholder.com/150x150?text=Omar+Saad'
        }
      },
      {
        user: { name: 'Nadia El-Hussein', email: 'nadia@example.com', password: 'password', role: 'trainer', location: 'Beirut' },
        trainer: {
          portfolio: [
            'https://via.placeholder.com/300x200?text=Pilates+Reform+Session',
            'https://via.placeholder.com/300x200?text=Injury+Recovery+Program',
            'https://via.placeholder.com/300x200?text=Core+Strength+Workshop'
          ],
          bio: 'Pilates instructor and rehabilitation specialist with 7 years of experience. I have rehabilitated 100+ clients from injuries, restoring mobility and preventing future issues. My Pilates method focuses on core strength, posture improvement, and injury prevention. Clients experience 50% reduction in back pain and significant improvements in balance and coordination. My evidence-based approach combines traditional Pilates with modern rehabilitation techniques.',
          specialties: ['Pilates', 'Rehabilitation', 'Core Training'],
          experience: 7,
          pricePerSession: 55,
          certificates: ['Certified Pilates Instructor', 'Rehabilitation Specialist', 'Anatomy and Physiology'],
          profilePicture: 'https://via.placeholder.com/150x150?text=Nadia+El-Hussein'
        }
      }
    ];

    for (const data of trainersData) {
      const user = new User(data.user);
      await user.save();

      const trainer = new Trainer({ ...data.trainer, user: user._id });
      await trainer.save();
    }

    // Create a sample client
    const client = new User({ name: 'John Doe', email: 'client@example.com', password: 'password', role: 'client', location: 'Beirut' });
    await client.save();

    console.log('Seeded data');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();