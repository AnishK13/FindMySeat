import React from 'react';
import { FaMapMarkedAlt, FaLock, FaLocationArrow } from 'react-icons/fa';

const features = [
  {
    icon: <FaMapMarkedAlt className="text-blue-600 text-3xl" />,
    title: 'Live Seat Map',
    desc: 'See real-time seat availability and layout.'
  },
  {
    icon: <FaLocationArrow className="text-green-600 text-3xl" />,
    title: 'Geolocation Booking',
    desc: 'Book only when you are physically in the hall.'
  },
  {
    icon: <FaLock className="text-purple-600 text-3xl" />,
    title: 'Secure Login',
    desc: 'Google OAuth ensures only authorized users.'
  }
];

const LandingPage = ({ onLogin }) => (
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-green-50">
    <header className="py-12 text-center">
      <h1 className="text-5xl font-extrabold text-blue-700 mb-2 drop-shadow">FindMySeat</h1>
      <p className="text-xl text-blue-900 mb-6">Smart Reading Hall Seat Booking</p>
      <img src="https://cdn-icons-png.flaticon.com/512/1946/1946488.png" alt="Reading Hall" className="mx-auto w-32 mb-6 drop-shadow-lg" />
      <button
        onClick={onLogin}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition mt-4"
      >
        Sign in with Google
      </button>
    </header>
    <section className="flex flex-col items-center mt-8 space-y-8">
      <div className="flex flex-wrap justify-center gap-8">
        {features.map((f, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg p-6 w-64 flex flex-col items-center border border-gray-100">
            {f.icon}
            <h3 className="mt-4 text-lg font-bold text-gray-800">{f.title}</h3>
            <p className="text-gray-600 mt-2 text-center">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
    <footer className="mt-auto py-4 text-center text-gray-500 text-sm w-full">&copy; {new Date().getFullYear()} FindMySeat</footer>
  </div>
);

export default LandingPage; 