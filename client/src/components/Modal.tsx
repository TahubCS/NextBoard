import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode; // The content (Form or Text)
    footer?: React.ReactNode;  // The buttons at the bottom
}

export const Modal = ({ isOpen, onClose, title, children, footer }: ModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
        <div 
            className="modal-box" 
            ref={modalRef} 
            onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
        >
            <div className="modal-header">
            <h2>{title}</h2>
            <button onClick={onClose} className="btn-close">
                <X size={20} />
            </button>
            </div>
            
            <div className="modal-content">
            {children}
            </div>

            {footer && <div className="modal-footer">{footer}</div>}
        </div>
        </div>
    );
};