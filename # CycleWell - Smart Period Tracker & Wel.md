# CycleWell - Smart Period Tracker & Wellness Guide

A comprehensive full-stack period tracking application with personalized wellness recommendations powered by Firebase.

## 🌟 Features

### 🔐 User Authentication & Onboarding
- Email/password authentication via Firebase Auth
- Comprehensive user onboarding collecting:
  - Personal information (name, age)
  - Physical metrics (weight, height)
  - Cycle information (typical cycle length)
  - Health conditions (optional)

### 🩸 Period Tracking
- Log period start and end dates
- Track flow intensity (light, medium, heavy)
- Record symptoms and mood
- Add personal notes
- Automatic cycle phase calculation

### 🤖 Smart Care Mode: Powered by Digital Gynaecologist
Personalized wellness recommendations based on:
- **Current cycle phase** (Menstruation, Follicular, Ovulation, Luteal)
- **Age group** (Teen, Adult, Above 40)
- **Weight category** (Underweight, Normal, Overweight)
- **Health conditions** (PCOS, Endometriosis, etc.)

### 📊 Comprehensive Dashboard
- Current cycle day and phase display
- Fertility status tracking
- Next period prediction
- Ovulation window calculation
- Visual cycle timeline

### 📅 Calendar View
- Visual period tracking calendar
- Flow intensity color coding
- Historical period data
- Cycle pattern analysis

### 📝 Daily Wellness Logging
- Mood tracking with emoji interface
- Symptom monitoring
- Water intake tracking
- Personal notes and observations

### 💡 Personalized Recommendations
For each cycle phase and user profile:
- **Recommended foods** to consume
- **Foods to avoid** for optimal health
- **Health precautions** and lifestyle tips
- **Home remedies** for symptom relief
- **Motivational quotes** for mental wellness

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Hook Form** for form management
- **Date-fns** for date manipulation
- **Lucide React** for icons
- **React Router** for navigation

### Backend
- **Firebase Authentication** for user management
- **Cloud Firestore** for data storage
- **Firebase Hosting** for deployment

### Development Tools
- **Vite** for build tooling
- **ESLint** for code linting
- **TypeScript** for type safety

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-period-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   
   Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   
   Enable the following services:
   - Authentication (Email/Password)
   - Cloud Firestore
   - Hosting (optional)

4. **Configure Firebase**
   
   Update `src/config/firebase.ts` with your Firebase config:
   ```typescript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

5. **Set up Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // User profiles
       match /userProfiles/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Period logs
       match /periodLogs/{document} {
         allow read, write: if request.auth != null && 
           request.auth.uid == resource.data.userId;
       }
       
       // Daily logs
       match /dailyLogs/{document} {
         allow read, write: if request.auth != null && 
           request.auth.uid == resource.data.userId;
       }
     }
   }
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

### Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase Hosting**
   ```bash
   firebase login
   firebase init hosting
   firebase deploy
   ```

## 📱 Usage Guide

### First Time Setup
1. **Sign up** with email and password
2. **Complete onboarding** by providing:
   - Personal information
   - Physical metrics
   - Cycle preferences
   - Health conditions (optional)

### Daily Usage
1. **Log periods** when they start/end
2. **Track daily wellness** including mood and symptoms
3. **View personalized recommendations** in Smart Care Mode
4. **Monitor cycle patterns** in the calendar view
5. **Check fertility status** and upcoming predictions

### Smart Care Mode
Access personalized recommendations that adapt to:
- Your current cycle phase
- Age-specific needs
- Weight-based considerations
- Health condition accommodations

## 🏗️ Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Main dashboard components
│   └── onboarding/        # User onboarding flow
├── contexts/              # React contexts
├── data/                  # Static data and recommendations
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── config/                # Configuration files
```

## 🔒 Security & Privacy

- All user data is encrypted and stored securely in Firebase
- Firestore security rules ensure users can only access their own data
- No sensitive health information is shared with third parties
- HIPAA-compliant data handling practices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Women's health experts for wellness recommendations
- Firebase team for excellent backend services
- React and TypeScript communities for amazing tools
- All the women who provided feedback during development

## 📞 Support

For support, email support@cyclewell.app or create an issue in this repository.

---

**CycleWell - Smart Care Mode: Powered by Digital Gynaecologist 🤖👩‍⚕️**

*Empowering women with personalized health insights and cycle awareness.*