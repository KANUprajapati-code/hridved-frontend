import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Save, Loader, ArrowLeft, Upload, Plus, Trash2, ShieldCheck, Leaf, Users, Award, Heart, History } from 'lucide-react';
import api from '../../utils/api';
import { ToastContext } from '../../context/ToastContext';
import { compressImage } from '../../utils/imageCompression';

const InputGroup = ({ label, name, type = "text", className = "", formData, handleChange }) => (
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

const ImageUploadGroup = ({ label, name, value, onUpload, uploading }) => (
    <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">{label}</label>
        <div className="flex flex-col gap-2">
            <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                value={value || ''}
                readOnly
                placeholder="Image URL will appear here..."
            />
            <div className="relative">
                <input
                    type="file"
                    id={`file-${name}`}
                    className="hidden"
                    onChange={(e) => onUpload(e, name)}
                    accept="image/*"
                />
                <label
                    htmlFor={`file-${name}`}
                    className="cursor-pointer bg-gray-100 py-2 px-4 rounded border hover:bg-gray-200 inline-flex items-center gap-2 transition-colors"
                >
                    {uploading === name ? <Loader className="animate-spin" size={16} /> : <Upload size={16} />}
                    {uploading === name ? 'Uploading...' : 'Upload Image'}
                </label>
            </div>
            {value && (
                <div className="mt-2 relative w-32 h-32 border rounded overflow-hidden">
                    <img src={value} alt={label} className="w-full h-full object-cover" />
                </div>
            )}
        </div>
    </div>
);

const AboutEditPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(null);
    const { addToast } = useContext(ToastContext);
    const [formData, setFormData] = useState({
        heroTitle: '',
        heroDescription: '',
        heroImage: '',
        ourStoryTitle: '',
        ourStoryDescription: '',
        ourStoryImage: '',
        foundedYear: '',
        experiseCount: '',
        healedCount: '',
        missionTitle: '',
        missionDescription: '',
        visionTitle: '',
        visionDescription: '',
        values: [],
        teamImage1: '',
        teamImage2: '',
        teamImage3: '',
        teamImage4: ''
    });

    const fetchAboutData = async () => {
        try {
            const { data } = await api.get('/about');
            setFormData({
                ...data,
                values: data.values || []
            });
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

    const handleUpload = async (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(fieldName);
        try {
            const compressedFile = await compressImage(file, { quality: 0.7, maxWidth: 1600 });
            const uploadData = new FormData();
            uploadData.append('image', compressedFile);

            const { data } = await api.post('/upload', uploadData);
            setFormData(prev => ({ ...prev, [fieldName]: data }));
            if (addToast) addToast('Image uploaded successfully', 'success');
        } catch (error) {
            console.error('Upload failed:', error);
            if (addToast) addToast('Image upload failed', 'error');
        } finally {
            setUploading(null);
        }
    };

    const handleValueChange = (index, field, value) => {
        const updatedValues = [...formData.values];
        updatedValues[index] = { ...updatedValues[index], [field]: value };
        setFormData(prev => ({ ...prev, values: updatedValues }));
    };

    const addValue = () => {
        setFormData(prev => ({
            ...prev,
            values: [...prev.values, { title: '', description: '', icon: 'Leaf' }]
        }));
    };

    const removeValue = (index) => {
        const updatedValues = formData.values.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, values: updatedValues }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            await api.put('/about', formData);
            if (addToast) addToast('About Us updated successfully', 'success');
        } catch (error) {
            console.error('Error updating about data:', error);
            if (addToast) addToast(error.response?.data?.message || 'Failed to update', 'error');
        } finally {
            setSaving(false);
        }
    };

    const iconOptions = [
        { name: 'Leaf', icon: <Leaf size={20} /> },
        { name: 'ShieldCheck', icon: <ShieldCheck size={20} /> },
        { name: 'Users', icon: <Users size={20} /> },
        { name: 'Award', icon: <Award size={20} /> },
        { name: 'Heart', icon: <Heart size={20} /> },
        { name: 'History', icon: <History size={20} /> },
    ];

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-primary" /></div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/admin" className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={20} /> Back to Dashboard
            </Link>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-primary">Edit About Us Page</h1>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="bg-primary text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
                >
                    {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                    Save All Changes
                </button>
            </div>

            <div className="space-y-8">
                {/* Hero Section */}
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                    <div className="bg-primary/5 px-8 py-4 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-primary">Hero Section</h2>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Hero Title" name="heroTitle" formData={formData} handleChange={handleChange} />
                            <ImageUploadGroup label="Hero Image" name="heroImage" value={formData.heroImage} onUpload={handleUpload} uploading={uploading} />
                            <InputGroup label="Hero Description" name="heroDescription" type="textarea" className="md:col-span-2" formData={formData} handleChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* Our Story Section */}
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                    <div className="bg-primary/5 px-8 py-4 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-primary">Our Story</h2>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputGroup label="Story Title" name="ourStoryTitle" formData={formData} handleChange={handleChange} />
                            <InputGroup label="Founded Year" name="foundedYear" formData={formData} handleChange={handleChange} />
                            <ImageUploadGroup label="Story Image" name="ourStoryImage" value={formData.ourStoryImage} onUpload={handleUpload} uploading={uploading} />
                            <InputGroup label="Expertise Count (e.g., 500+)" name="experiseCount" formData={formData} handleChange={handleChange} />
                            <InputGroup label="Healed Count (e.g., 3M+)" name="healedCount" formData={formData} handleChange={handleChange} />
                            <div className="md:col-span-3">
                                <InputGroup label="Story Description" name="ourStoryDescription" type="textarea" formData={formData} handleChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mission & Vision */}
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                    <div className="bg-primary/5 px-8 py-4 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-primary">Mission & Vision</h2>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Mission Title" name="missionTitle" formData={formData} handleChange={handleChange} />
                            <InputGroup label="Vision Title" name="visionTitle" formData={formData} handleChange={handleChange} />
                            <InputGroup label="Mission Description" name="missionDescription" type="textarea" formData={formData} handleChange={handleChange} />
                            <InputGroup label="Vision Description" name="visionDescription" type="textarea" formData={formData} handleChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* Values Section */}
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                    <div className="bg-primary/5 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-primary">Our Values</h2>
                        <button
                            onClick={addValue}
                            className="bg-secondary text-primary px-3 py-1 rounded-md text-sm font-bold flex items-center gap-1 hover:bg-secondary-dark transition-colors"
                        >
                            <Plus size={16} /> Add Value
                        </button>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {formData.values.map((value, index) => (
                                <div key={index} className="border rounded-xl p-4 bg-gray-50 relative group">
                                    <button
                                        onClick={() => removeValue(index)}
                                        className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <div className="mb-3">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Icon</label>
                                        <div className="flex flex-wrap gap-2">
                                            {iconOptions.map(opt => (
                                                <button
                                                    key={opt.name}
                                                    onClick={() => handleValueChange(index, 'icon', opt.name)}
                                                    className={`p-2 rounded-lg border transition-all ${value.icon === opt.name ? 'border-primary bg-primary/10 text-primary' : 'bg-white text-gray-400 border-gray-200'}`}
                                                >
                                                    {opt.icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Value Title"
                                        className="w-full mb-2 p-2 border rounded focus:outline-none focus:border-primary font-bold"
                                        value={value.title}
                                        onChange={(e) => handleValueChange(index, 'title', e.target.value)}
                                    />
                                    <textarea
                                        placeholder="Value Description"
                                        className="w-full p-2 border rounded focus:outline-none focus:border-primary text-sm h-24"
                                        value={value.description}
                                        onChange={(e) => handleValueChange(index, 'description', e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Team Images */}
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                    <div className="bg-primary/5 px-8 py-4 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-primary">Team Images</h2>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ImageUploadGroup label="Team Image 1" name="teamImage1" value={formData.teamImage1} onUpload={handleUpload} uploading={uploading} />
                            <ImageUploadGroup label="Team Image 2" name="teamImage2" value={formData.teamImage2} onUpload={handleUpload} uploading={uploading} />
                            <ImageUploadGroup label="Team Image 3" name="teamImage3" value={formData.teamImage3} onUpload={handleUpload} uploading={uploading} />
                            <ImageUploadGroup label="Team Image 4" name="teamImage4" value={formData.teamImage4} onUpload={handleUpload} uploading={uploading} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="bg-primary text-white px-10 py-3 rounded-xl flex items-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50 shadow-xl"
                >
                    {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                    Save All Changes
                </button>
            </div>
        </div>
    );
};

export default AboutEditPage;
