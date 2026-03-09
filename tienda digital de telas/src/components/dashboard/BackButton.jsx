import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

function BackButton({ to = '/admin', label = 'Volver al Panel' }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };

    return (
        <button
            onClick={handleClick}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 hover:shadow-md group"
        >
            <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium text-sm">{label}</span>
        </button>
    );
}

export default BackButton;
