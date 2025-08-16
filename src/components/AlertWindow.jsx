import React from "react";

export default function AlertWindow({ message, onClose }) {
    if (!message) return null;
    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-red-500 text-white px-6 py-3 rounded shadow-lg flex items-center gap-4">
                <span>{message}</span>
                <button
                    className="ml-4 px-2 py-1 bg-white text-red-500 rounded hover:bg-gray-100"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
}
