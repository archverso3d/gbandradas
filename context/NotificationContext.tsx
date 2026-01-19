import React, { createContext, useState, useContext, ReactNode } from 'react';
import { NotificationModal } from '../components/ui/NotificationModal';

interface NotificationContextType {
    alert: (message: string, title?: string) => Promise<void>;
    confirm: (message: string, title?: string) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<{
        title: string;
        message: string;
        type: 'alert' | 'confirm';
        resolve: (value: any) => void;
    } | null>(null);

    const showAlert = (message: string, title: string = 'Notificação') => {
        return new Promise<void>((resolve) => {
            setConfig({ title, message, type: 'alert', resolve });
            setIsOpen(true);
        });
    };

    const showConfirm = (message: string, title: string = 'Confirmação') => {
        return new Promise<boolean>((resolve) => {
            setConfig({ title, message, type: 'confirm', resolve });
            setIsOpen(true);
        });
    };

    const handleClose = (value: boolean) => {
        setIsOpen(false);
        if (config) {
            config.resolve(value);
        }
    };

    return (
        <NotificationContext.Provider value={{ alert: showAlert, confirm: showConfirm }}>
            {children}
            {config && (
                <NotificationModal
                    isOpen={isOpen}
                    title={config.title}
                    message={config.message}
                    type={config.type}
                    onClose={handleClose}
                />
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
