import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Save, Loader } from 'lucide-react';
import { ToastContext } from '../../context/ToastContext';

const AboutEditPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { addToast } = useContext(ToastContext);
    const [formData, setFormData] = useState({
        heroTitle: '',
        heroDescription: '',
        heroImage: '',
        ourStoryTitle: '',
        ourStoryDescription: '',
        foundedYear: '',
        experiseCount: '',
        healedCount: '',
        missionTitle: '',
        missionDescription: '',
        visionTitle: '',
        visionDescription: '',
        teamImage1: '',
        teamImage2: '',
        teamImage3: '',
        teamImage4: ''
    });

    const fetchAboutData = async () => {
        try {
            const { data } = await api.get('/about');
            setFormData(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching about data:', error);
            if (addToast) addToast('Failed to load data', 'error');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAboutData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true // Important for admin protection
            };
            await axios.put('/api/about', formData, config);
            addToast('About Us updated successfully', 'success');
        } catch (error) {
            console.error('Error updating about data:', error);
            addToast(error.response?.data?.message || 'Failed to update', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin" /></div>;

    const InputGroup = ({ label, name, type = "text", className = "" }) => (
        <div className={`mb-4 ${className}`}>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
                {label}
            </label>
            {type === 'textarea' ? (
                <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline min-h-[100px]"
                    id={name}
                    name={name}
                    value={formData[name] || ''}
                    onChange={handleChange}
                />
            ) : (
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id={name}
                    type={type}
                    name={name}
                    value={formData[name] || ''}
                    onChange={handleChange}
                />
            )}
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Edit About Us Page</h1>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">

                {/* Hero Section */}
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Hero Section</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Hero Title" name="heroTitle" />
                    <InputGroup label="Hero Image URL" name="heroImage" />
                    <InputGroup label="Hero Description" name="heroDescription" type="textarea" className="md:col-span-2" />
                </div>

                {/* Our Story Section */}
                <h2 className="text-xl font-semibold mb-4 border-b pb-2 mt-8">Our Story</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputGroup label="Story Title" name="ourStoryTitle" />
                    <InputGroup label="Founded Year" name="foundedYear" />
                    <InputGroup label="Expertise Count (e.g., 500+)" name="experiseCount" />
                    <InputGroup label="Healed Count (e.g., 3M+)" name="healedCount" />
                    <InputGroup label="Story Description" name="ourStoryDescription" type="textarea" className="md:col-span-3" />
                </div>

                {/* Mission & Vision */}
                <h2 className="text-xl font-semibold mb-4 border-b pb-2 mt-8">Mission & Vision</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Mission Title" name="missionTitle" />
                    <InputGroup label="Vision Title" name="visionTitle" />
                    <InputGroup label="Mission Description" name="missionDescription" type="textarea" />
                    <InputGroup label="Vision Description" name="visionDescription" type="textarea" />
                </div>

                {/* Team Images */}
                <h2 className="text-xl font-semibold mb-4 border-b pb-2 mt-8">Team Images</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Image 1 URL" name="teamImage1" />
                    <InputGroup label="Image 2 URL" name="teamImage2" />
                    <InputGroup label="Image 3 URL" name="teamImage3" />
                    <InputGroup label="Image 4 URL" name="teamImage4" />
                </div>

            </form>
        </div>
    );
};

export default AboutEditPage;
