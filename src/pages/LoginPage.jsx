import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';
const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const redirect = location.search ? location.search.split('=')[1] : '/';

    useEffect(() => {
        if (user) {
            if (redirect === '/' && user.isAdmin) {
                navigate('/admin');
            } else {
                navigate(redirect);
            }
        }
    }, [navigate, user, redirect]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate(redirect);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    return (
        <motion.div
            className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
                <motion.div variants={itemVariants} className="text-center">
                    <h2 className="text-3xl font-extrabold text-primary font-serif">
                        Sign in to your account
                    </h2>
                </motion.div>

                {error && (
                    <motion.div
                        variants={itemVariants}
                        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm"
                    >
                        {error}
                    </motion.div>
                )}

                {/* OAuth Buttons */}
                <motion.div variants={itemVariants} className="space-y-3">
                    <GoogleAuthButton text="Continue with Google" redirect={redirect} />
                </motion.div>

                {/* Divider */}
                <motion.div variants={itemVariants} className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                    </div>
                </motion.div>

                {/* Email/Password Form */}
                <form className="mt-8 space-y-6" onSubmit={submitHandler}>
                    <motion.div variants={itemVariants} className="rounded-md shadow-sm space-y-4">
                        <div>
                            <input
                                type="email"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-secondary focus:border-secondary focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-secondary focus:border-secondary focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-all"
                        >
                            Sign in
                        </motion.button>
                    </motion.div>
                </form>

                {/* Register Link */}
                <motion.div variants={itemVariants} className="text-center">
                    <p className="text-sm text-gray-600">
                        New Customer?{' '}
                        <Link
                            to={redirect ? `/register?redirect=${redirect}` : '/register'}
                            className="font-medium text-secondary hover:text-primary transition-colors"
                        >
                            Register Here
                        </Link>
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default LoginPage;
