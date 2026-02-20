import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { CheckCircle, AlertCircle, Zap } from 'lucide-react';

const FshipTestPage = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [testPincode, setTestPincode] = useState('560001');

  const runHealthCheck = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await api.get('/shipping/health');
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to test API');
    } finally {
      setLoading(false);
    }
  };

  const testServiceability = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await api.post('/shipping/serviceability', {
        pincode: testPincode,
        weight: 0.5,
        cod: 0,
      });
      setResults({
        type: 'serviceability',
        pincode: testPincode,
        data: response.data,
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Serviceability check failed');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">FShip API Test</h1>
          </div>
          <p className="text-gray-600">Test your FShip API integration</p>
        </motion.div>

        {/* Test Buttons */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
        >
          <div className="space-y-6">
            {/* Health Check Button */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">API Health Check</h2>
              <motion.button
                onClick={runHealthCheck}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full px-6 py-3 rounded-lg font-bold text-white transition-all ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-md'
                }`}
              >
                {loading ? 'Testing...' : 'Run Health Check'}
              </motion.button>
            </div>

            {/* Serviceability Test */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Serviceability Check</h2>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={testPincode}
                  onChange={(e) => setTestPincode(e.target.value)}
                  placeholder="Enter pincode (e.g., 560001)"
                  maxLength="6"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <motion.button
                  onClick={testServiceability}
                  disabled={loading || !testPincode}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-2 rounded-lg font-bold text-white transition-all ${
                    loading || !testPincode
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 shadow-md'
                  }`}
                >
                  {loading ? 'Testing...' : 'Test'}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div variants={itemVariants}>
            <LoadingSpinner size="lg" />
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            variants={itemVariants}
            className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8"
          >
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-red-900 mb-2">Error</h3>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {results && (
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h3 className="text-2xl font-bold text-gray-900">
                {results.type === 'serviceability' ? 'Serviceability Results' : 'Health Check Results'}
              </h3>
            </div>

            {/* Health Check Results */}
            {results.message && (
              <motion.div variants={itemVariants} className="mb-8 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong>{' '}
                    <span className={results.status === 'healthy' ? 'text-green-600 font-bold' : 'text-yellow-600'}>
                      {results.status?.toUpperCase()}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>API Configured:</strong> {results.apiConfigured ? '✓ Yes' : '✗ No'}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Base URL:</strong> {results.baseUrl}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Tested At:</strong> {new Date(results.timestamp).toLocaleString()}
                  </p>
                </div>

                {/* Individual Test Results */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900">Detailed Tests:</h4>
                  {results.tests && Object.entries(results.tests).map(([testName, testResult]) => (
                    <motion.div
                      key={testName}
                      variants={itemVariants}
                      className={`rounded-lg p-4 border ${
                        testResult.status === 'success'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {testResult.status === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        <h5 className="font-bold text-gray-900 capitalize">{testName}</h5>
                      </div>
                      <p className={`text-sm ${testResult.status === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                        {testResult.status === 'success' ? '✓ Passed' : '✗ Failed'}
                      </p>
                      {testResult.pincode && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Pincode:</strong> {testResult.pincode}
                        </p>
                      )}
                      {testResult.error && (
                        <p className="text-sm text-red-600 mt-2">
                          <strong>Error:</strong> {testResult.error}
                        </p>
                      )}
                      {testResult.data && (
                        <pre className="bg-gray-900 text-green-400 p-3 rounded mt-3 text-xs overflow-x-auto">
                          {JSON.stringify(testResult.data, null, 2)}
                        </pre>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Serviceability Results */}
            {results.type === 'serviceability' && (
              <motion.div variants={itemVariants} className="space-y-4">
                <div className={`rounded-lg p-4 border ${
                  results.data?.serviceable ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <p className="text-sm text-gray-600">
                    <strong>Pincode:</strong> {results.pincode}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Serviceable:</strong>{' '}
                    <span className={results.data?.serviceable ? 'text-green-600 font-bold' : 'text-yellow-600'}>
                      {results.data?.serviceable ? '✓ Yes' : '⚠ No'}
                    </span>
                  </p>
                </div>

                {results.data?.shippingOptions && (
                  <div className="mt-4">
                    <h4 className="font-bold text-gray-900 mb-3">Shipping Options:</h4>
                    <div className="space-y-2">
                      {results.data.shippingOptions.map((option, idx) => (
                        <motion.div
                          key={idx}
                          variants={itemVariants}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-gray-900">{option.type} Delivery</p>
                              <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                              <p className="text-sm text-gray-600">Delivery: {option.days} days</p>
                            </div>
                            <p className="font-bold text-blue-600 text-lg">₹{option.charge}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                <pre className="bg-gray-900 text-green-400 p-4 rounded mt-4 text-xs overflow-x-auto">
                  {JSON.stringify(results.data, null, 2)}
                </pre>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Info Box */}
        <motion.div
          variants={itemVariants}
          className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <h4 className="font-bold text-blue-900 mb-3">Test Information</h4>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Health Check tests API connectivity and configuration</li>
            <li>✓ Serviceability Check tests shipping rate calculation for a pincode</li>
            <li>✓ Use real pincodes (6 digits) for accurate results</li>
            <li>✓ Check your FSHIP_API_KEY in server .env file if tests fail</li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FshipTestPage;
