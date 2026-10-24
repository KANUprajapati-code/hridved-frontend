
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Trash2, Check, X, Edit2, ArrowLeft } from 'lucide-react';

const UserListPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await api.delete(`/users/${id}`);
                fetchUsers();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const toggleAdminHandler = async (user) => {
        if (window.confirm(`Are you sure you want to ${user.isAdmin ? 'remove' : 'make'} this user admin?`)) {
            try {
                await api.put(`/users/${user._id}`, { isAdmin: !user.isAdmin });
                fetchUsers();
            } catch (error) {
                console.error(error);
                alert('Error updating user');
            }
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/admin" className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={20} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-serif font-bold text-primary mb-6">Users</h1>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="py-3 px-4 font-bold text-gray-700">ID</th>
                            <th className="py-3 px-4 font-bold text-gray-700">NAME</th>
                            <th className="py-3 px-4 font-bold text-gray-700">EMAIL</th>
                            <th className="py-3 px-4 font-bold text-gray-700">ADMIN</th>
                            <th className="py-3 px-4 font-bold text-gray-700">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id} className="border-b last:border-0 hover:bg-gray-50 transition">
                                <td className="py-3 px-4 text-sm">{user._id}</td>
                                <td className="py-3 px-4 text-sm font-medium">{user.name}</td>
                                <td className="py-3 px-4 text-sm"><a href={`mailto:${user.email}`}>{user.email}</a></td>
                                <td className="py-3 px-4 text-sm">
                                    {user.isAdmin ? (
                                        <Check size={20} className="text-green-600" />
                                    ) : (
                                        <X size={20} className="text-red-500" />
                                    )}
                                </td>
                                <td className="py-3 px-4 text-sm">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleAdminHandler(user)}
                                            className="text-blue-600 hover:text-blue-800"
                                            title={user.isAdmin ? "Remove Admin" : "Make Admin"}
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        {!user.isAdmin && (
                                            <button
                                                onClick={() => deleteHandler(user._id)}
                                                className="text-red-500 hover:text-red-700"
                                                title="Delete User"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserListPage;
