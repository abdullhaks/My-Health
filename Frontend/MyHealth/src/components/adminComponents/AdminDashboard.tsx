
import { FaVideo } from "react-icons/fa";
import { FaNotesMedical } from "react-icons/fa6";
import adminimg from "../../assets/doctorLogin.png"

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Hero Card */}
      <div className="flex flex-col lg:flex-row gap-6">
      <div className="relative flex-1 rounded-xl overflow-hidden shadow bg-gradient-to-r from-blue-500 to-cyan-400 h-96 flex items-center px-6">
          {/* Glowing Advertisement Text */}
          <div className="z-10 text-white">
            <h2 className="text-2xl md:text-3xl font-bold text-green-700">
              Aster MIMS HOSPITALS
            </h2>
            <p className="text-sm md:text-base font-medium mt-1">
              We'll Treat You Well
            </p>
            <p className="text-xs mt-2">www.asterhospitals.in</p>
            <p className="text-xs">+91 3434 5656 999</p>
          </div>

          {/* Image at bottom right */}
          <img
            src={adminimg}
            alt="Hospital Banner"
            className="absolute bottom-0 right-0 h-full object-contain"
          />
        </div>


        {/* Upcoming Appointments */}
        <div className="w-full lg:w-80 rounded-xl shadow bg-white p-5">
          <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
          <div className="space-y-4">
            <div className="bg-red-100 rounded-lg px-4 py-3 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Fri</p>
                <p className="text-xl font-bold">14</p>
              </div>
              <div className="text-gray-600 text-sm">11</div>
            </div>
            {[7, 4, 2].map((count, i) => (
              <div key={i} className="bg-gray-100 rounded-lg px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Sat</p>
                  <p className="text-xl font-bold">15</p>
                </div>
                <div className="text-gray-600 text-sm">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Updates */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Today's Updates <span className="text-sm text-gray-500">13-04-2025 Thu</span></h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-green-400 text-white p-6 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaVideo className="text-2xl" />
              <div>
                <p className="font-medium">Online consultations</p>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs mt-1">start from : 11:30 AM</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-400 text-white p-6 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaNotesMedical className="text-2xl" />
              <div>
                <p className="font-medium">Report Analysis</p>
                <p className="text-2xl font-bold">03</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Doctors */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Recommended Doctors</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Video card */}
          <div className="rounded-xl overflow-hidden shadow bg-gray-500">
            {/* <img
              src="https://www.shutterstock.com/image-photo/female-doctor-checking-boy-pediatrician-260nw-1698796580.jpg"
              alt="Doctor"
              className="w-full h-40 object-cover"
            /> */}
            <div className="p-4">
              <button className="bg-black text-white px-4 py-2 rounded">▶</button>
            </div>
          </div>

          {/* Article card 1 */}
          <div className="bg-gray-800 text-white rounded-xl p-6 flex flex-col justify-between">
            <div>
              <p className="font-semibold">
                Diabetes in migrant communities : a rising healthcare priority.
              </p>
            </div>
            <p className="text-sm mt-4">Dr. Muhammed Ks, BHMS</p>
            <p className="text-xs">08-09-2025</p>
          </div>

          {/* Article card 2 */}
          <div className="rounded-xl overflow-hidden shadow bg-gray-400">
            {/* <img
              src="https://www.livemint.com/lm-img/img/2023/09/13/600x338/Nipah_virus_Kerala_1694599250231_1694599250450.jpg"
              alt="Nipah Alert"
              className="w-full h-40 object-cover"
            /> */}
            <div className="p-4 text-sm font-medium">
              Kerala Issues Nipah Alert in Five Districts.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
