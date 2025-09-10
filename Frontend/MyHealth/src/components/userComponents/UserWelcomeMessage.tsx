// import { 
//   Heart, 
//   Pill, 
//   Clock, 
//   AlertCircle, 
//   CheckCircle, 
//   Sun, 
//   Moon, 
//   Sunset,
//   Wind,
//   Thermometer,
//   Shield,
//   User
// } from 'lucide-react';

// const UserWelcomeMessage = ({ user, latestPrescription }:{user,latestPrescription}) => {
//   // Get current time for greeting
//   const getCurrentGreeting = () => {
//     const hour = new Date().getHours();
//     if (hour < 12) return { text: 'Good Morning', icon: Sun, color: 'from-amber-400 to-orange-500' };
//     if (hour < 17) return { text: 'Good Afternoon', icon: Sun, color: 'from-blue-400 to-indigo-500' };
//     if (hour < 20) return { text: 'Good Evening', icon: Sunset, color: 'from-purple-400 to-pink-500' };
//     return { text: 'Good Night', icon: Moon, color: 'from-indigo-500 to-purple-600' };
//   };

//   const greeting = getCurrentGreeting();
//   const GreetingIcon = greeting.icon;

//   // Format medication frequency for display
//   const formatFrequency = (frequency) => {
//     if (!frequency) return '';
//     return frequency.toLowerCase().replace('x', '×').replace('daily', 'daily');
//   };

//   // Get condition-specific advice
//   const getConditionAdvice = (condition: string) => {
//     const advice = {
//       'asthma': {
//         icon: Wind,
//         tips: ['Avoid cold foods', 'Stay away from dusty areas', 'Keep your inhaler handy', 'Monitor air quality'],
//         color: 'from-cyan-400 to-blue-500'
//       },
//       'diabetes': {
//         icon: Thermometer,
//         tips: ['Monitor blood sugar regularly', 'Maintain a balanced diet', 'Exercise regularly', 'Stay hydrated'],
//         color: 'from-green-400 to-emerald-500'
//       },
//       'hypertension': {
//         icon: Heart,
//         tips: ['Limit sodium intake', 'Exercise regularly', 'Manage stress', 'Monitor blood pressure'],
//         color: 'from-red-400 to-pink-500'
//       }
//     };

//     type ConditionKey = keyof typeof advice;
//     const conditionKey = condition?.toLowerCase() as ConditionKey;
//     return advice[conditionKey] ?? {
//       icon: Shield,
//       tips: ['Take medications as prescribed', 'Follow doctor\'s advice', 'Maintain healthy habits', 'Stay hydrated'],
//       color: 'from-purple-400 to-indigo-500'
//     };
//   };

//   const conditionData = latestPrescription?.medicalCondition 
//     ? getConditionAdvice(latestPrescription.medicalCondition)
//     : null;

//   if (!latestPrescription) {
//     return (
//       <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl shadow-xl p-6 mb-6 border border-blue-100">
//         <div className="flex items-center gap-4 mb-4">
//           <div className={`w-14 h-14 bg-gradient-to-r ${greeting.color} rounded-2xl flex items-center justify-center shadow-lg`}>
//             <GreetingIcon className="w-7 h-7 text-white" />
//           </div>
//           <div className="flex-1">
//             <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
//               {greeting.text}, {user?.fullName || 'User'}! 👋
//             </h2>
//             <p className="text-gray-600 text-base lg:text-lg">
//               Welcome back to your health dashboard
//             </p>
//           </div>
//         </div>
        
//         <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 text-white">
//           <div className="flex items-center gap-3">
//             <Heart className="w-6 h-6" />
//             <div>
//               <p className="font-semibold text-lg">Stay Healthy!</p>
//               <p className="text-blue-100 text-sm">No active prescriptions. Keep up with your wellness routine.</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const medication = latestPrescription.medications?.[0];
//   const ConditionIcon = conditionData?.icon || Shield;

//   return (
//     <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl shadow-xl p-4 lg:p-6 mb-6 border border-blue-100">
//       {/* Main Greeting */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
//         <div className={`w-14 h-14 bg-gradient-to-r ${greeting.color} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
//           <GreetingIcon className="w-7 h-7 text-white" />
//         </div>
//         <div className="flex-1 min-w-0">
//           <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
//             {greeting.text}, {user?.fullName || 'User'}! 👋
//           </h2>
//           <p className="text-gray-600 text-base lg:text-lg">
//             Time for your daily health check-in
//           </p>
//         </div>
//       </div>

//       {/* Medication Reminder */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
//         {/* Medication Card */}
//         <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 lg:p-5 text-white shadow-lg">
//           <div className="flex items-start gap-3 mb-4">
//             <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
//               <Pill className="w-5 h-5" />
//             </div>
//             <div className="flex-1 min-w-0">
//               <h3 className="font-bold text-lg lg:text-xl mb-1">Medication Reminder</h3>
//               <p className="text-emerald-100 text-sm">Have you taken your medicine today?</p>
//             </div>
//           </div>
          
//           {medication && (
//             <div className="space-y-3">
//               <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
//                 <div className="flex flex-wrap items-center gap-2 mb-2">
//                   <span className="font-semibold text-base lg:text-lg capitalize">
//                     {medication.name}
//                   </span>
//                   <span className="bg-white/25 px-2 py-1 rounded-full text-xs font-medium">
//                     {medication.dosage}
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-4 text-sm text-emerald-100">
//                   <div className="flex items-center gap-1">
//                     <Clock className="w-4 h-4" />
//                     <span>{formatFrequency(medication.frequency)}</span>
//                   </div>
//                   <span>• {medication.duration}</span>
//                 </div>
//               </div>
              
//               {medication.instructions && (
//                 <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
//                   <p className="text-sm font-medium mb-1">Instructions:</p>
//                   <p className="text-xs text-emerald-100 leading-relaxed capitalize">
//                     {medication.instructions}
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Health Condition & Tips */}
//         <div className={`bg-gradient-to-br ${conditionData?.color || 'from-purple-500 to-indigo-600'} rounded-2xl p-4 lg:p-5 text-white shadow-lg`}>
//           <div className="flex items-start gap-3 mb-4">
//             <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
//               <ConditionIcon className="w-5 h-5" />
//             </div>
//             <div className="flex-1 min-w-0">
//               <h3 className="font-bold text-lg lg:text-xl mb-1">
//                 {latestPrescription.medicalCondition} Care
//               </h3>
//               <p className="text-white/80 text-sm">Health tips for today</p>
//             </div>
//           </div>
          
//           <div className="space-y-2">
//             {conditionData?.tips.slice(0, 3).map((tip, index) => (
//               <div key={index} className="flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2">
//                 <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/80" />
//                 <span className="text-sm text-white/90 leading-relaxed">{tip}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Additional Notes */}
//       {medication?.notes && (
//         <div className="mt-4 lg:mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
//           <div className="flex items-start gap-3">
//             <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
//             <div className="flex-1 min-w-0">
//               <p className="font-semibold text-amber-800 text-sm lg:text-base mb-1">Important Notes:</p>
//               <p className="text-amber-700 text-xs lg:text-sm leading-relaxed capitalize">
//                 {medication.notes}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Quick Actions */}
//       <div className="mt-4 lg:mt-6 flex flex-wrap gap-2 lg:gap-3">
//         <button className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
//           ✅ Mark as Taken
//         </button>
//         <button className="flex-1 sm:flex-none bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 shadow hover:shadow-md">
//           📋 View Full Prescription
//         </button>
//         <button className="flex-1 sm:flex-none bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 shadow hover:shadow-md">
//           📞 Contact Doctor
//         </button>
//       </div>
//     </div>
//   );
// };

// export default UserWelcomeMessage;