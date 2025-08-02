import React from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaUserShield, FaChartLine, FaUsers, FaClock } from 'react-icons/fa';

const LandingPage = ({ onStudentLogin, onAdminLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <FaGraduationCap className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">FindMySeat</h1>
            </div>
            <div className="text-sm text-gray-500">
              Smart Reading Hall Management
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
          >
            Welcome to
            <span className="text-blue-600"> FindMySeat</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
          >
            The smart solution for efficient reading hall seat management. 
            Choose your role to get started.
          </motion.p>
        </div>

        {/* Login Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Student Login */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
              <div className="flex items-center justify-center">
                <FaGraduationCap className="h-12 w-12 text-white" />
              </div>
              <h3 className="mt-4 text-2xl font-bold text-white text-center">Student Access</h3>
              <p className="mt-2 text-blue-100 text-center">
                Book seats, manage your sessions, and study efficiently
              </p>
            </div>
            <div className="px-6 py-8">
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <FaClock className="h-5 w-5 text-blue-500 mr-3" />
                  <span>Real-time seat availability</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaUsers className="h-5 w-5 text-blue-500 mr-3" />
                  <span>Easy booking and cancellation</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaChartLine className="h-5 w-5 text-blue-500 mr-3" />
                  <span>Location-based access control</span>
                </div>
              </div>
              <button
                onClick={onStudentLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
              >
                Login as Student
              </button>
            </div>
          </motion.div>

          {/* Admin Login */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-8">
              <div className="flex items-center justify-center">
                <FaUserShield className="h-12 w-12 text-white" />
              </div>
              <h3 className="mt-4 text-2xl font-bold text-white text-center">Admin Access</h3>
              <p className="mt-2 text-purple-100 text-center">
                Monitor analytics, manage users, and oversee operations
              </p>
            </div>
            <div className="px-6 py-8">
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <FaChartLine className="h-5 w-5 text-purple-500 mr-3" />
                  <span>Real-time analytics dashboard</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaUsers className="h-5 w-5 text-purple-500 mr-3" />
                  <span>User management and monitoring</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaClock className="h-5 w-5 text-purple-500 mr-3" />
                  <span>Advanced reporting and insights</span>
                </div>
              </div>
              <button
                onClick={onAdminLogin}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
              >
                Login as Admin
              </button>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20"
        >
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Key Features
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaClock className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Real-time Updates</h4>
              <p className="text-gray-600">Live seat availability and instant booking confirmations</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaChartLine className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics</h4>
              <p className="text-gray-600">Comprehensive insights and performance metrics</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaUsers className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Smart Management</h4>
              <p className="text-gray-600">Efficient user management and automated processes</p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} FindMySeat. All rights reserved.</p>
            <p className="mt-2 text-sm">Smart Reading Hall Seat Booking System</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 