import React from 'react';
import { motion } from 'framer-motion';
import { useCheckout } from '../context/CheckoutContext';

export default function CheckoutStepIndicator() {
    const { checkoutData } = useCheckout();
    
    const steps = [
        { number: 1, label: 'Address', id: 'address' },
        { number: 2, label: 'Shipping', id: 'shipping' },
        { number: 3, label: 'Payment', id: 'payment' },
        { number: 4, label: 'Success', id: 'success' },
    ];

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1,
            },
        },
    };

    const stepVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 },
        },
    };

    const circleVariants = {
        idle: { scale: 1 },
        active: {
            scale: 1.15,
            boxShadow: '0 0 0 8px rgba(59, 130, 246, 0.2)',
            transition: { type: 'spring', stiffness: 300, damping: 20 },
        },
        completed: {
            scale: 1,
            transition: { duration: 0.2 },
        },
    };

    const lineVariants = {
        hidden: { scaleX: 0 },
        active: {
            scaleX: 1,
            transition: {
                duration: 0.5,
                ease: 'easeInOut',
            },
        },
    };

    return (
        <motion.div
            className="w-full py-6 bg-white border-b border-gray-100"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="flex items-center justify-between gap-2">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <motion.div
                                className="flex flex-col items-center flex-1"
                                variants={stepVariants}
                            >
                                <motion.div
                                    className={`
                                        w-10 h-10 rounded-full flex items-center justify-center mb-2 font-bold text-sm
                                        transition-all duration-300
                                        ${checkoutData.currentStep > step.number
                                            ? 'bg-green-500 text-white'
                                            : checkoutData.currentStep === step.number
                                            ? 'bg-blue-500 text-white border-2 border-blue-600'
                                            : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                                        }
                                    `}
                                    variants={circleVariants}
                                    animate={
                                        checkoutData.currentStep > step.number
                                            ? 'completed'
                                            : checkoutData.currentStep === step.number
                                            ? 'active'
                                            : 'idle'
                                    }
                                >
                                    {checkoutData.currentStep > step.number ? (
                                        <motion.span
                                            animate={{ scale: [0.8, 1.2, 1] }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            ✓
                                        </motion.span>
                                    ) : (
                                        <span>{step.number}</span>
                                    )}
                                </motion.div>
                                <motion.p
                                    className={`
                                        text-xs font-medium whitespace-nowrap text-center
                                        transition-colors duration-300
                                        ${checkoutData.currentStep >= step.number
                                            ? 'text-blue-600'
                                            : 'text-gray-600'
                                        }
                                    `}
                                    animate={{
                                        opacity: checkoutData.currentStep >= step.number ? 1 : 0.6,
                                    }}
                                >
                                    {step.label}
                                </motion.p>
                            </motion.div>

                            {index < steps.length - 1 && (
                                <motion.div
                                    className={`
                                        h-1 flex-1 rounded-full mb-6
                                        transition-all duration-300
                                        ${checkoutData.currentStep > step.number
                                            ? 'bg-green-500'
                                            : checkoutData.currentStep === step.number
                                            ? 'bg-blue-300'
                                            : 'bg-gray-200'
                                        }
                                    `}
                                    variants={lineVariants}
                                    animate={checkoutData.currentStep > step.number ? 'active' : 'hidden'}
                                    initial="hidden"
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
