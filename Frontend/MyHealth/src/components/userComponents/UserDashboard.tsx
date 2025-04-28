

function UserDashboard() {
  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
      
      {/* Banner / Advertisement */}
      <div className="col-span-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-2xl p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-4">Welcome Back!</h2>
        <p className="text-lg">Check out the latest updates and promotions tailored just for you.</p>
        <div className="mt-4">
          <button className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-100">
            Explore Now
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-bold mb-4 text-blue-800">Calendar</h2>
        <div className="text-gray-600">
          {/* Dummy calendar view */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="font-semibold text-sm">{day}</div>
            ))}
            {Array.from({ length: 30 }, (_, i) => (
              <div key={i} className="p-2 text-sm hover:bg-blue-100 rounded-lg cursor-pointer">{i + 1}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Blogs and News */}
      <div className="col-span-3 bg-white rounded-2xl p-6 shadow-md mt-4">
        <h2 className="text-2xl font-bold mb-6 text-blue-800">Latest Blogs & News</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <h3 className="text-lg font-semibold mb-2">Blog Title {item}</h3>
              <p className="text-gray-600 text-sm">
                Short description about the blog/news article. Stay updated with health trends!
              </p>
              <button className="mt-2 text-blue-600 text-sm hover:underline">Read More</button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default UserDashboard