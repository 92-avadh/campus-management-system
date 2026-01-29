import React from 'react';
import { FaBell } from 'react-icons/fa';

const NotificationBell = () => {
    console.log('NotificationBell rendered');
    return (
        <div>
            <FaBell style={{ display: 'block', margin: 'auto' }} />
        </div>
    );
};

export default NotificationBell;
