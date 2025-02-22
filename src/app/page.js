import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NOTIFICATION_TIMES = [180, 120, 60, 30, 15, 0];
const ADMIN_PASSWORD = '136580';
const ADMIN_KEYS = ['Control', 'Alt', 'M']; // Yeni kısayol kombinasyonu

const EventTimer = () => {
  const [referenceTime, setReferenceTime] = useState(() => {
    const saved = localStorage.getItem('referenceTime');
    if (saved) {
      return new Date(saved);
    }
    const initialTime = new Date();
    initialTime.setHours(16, 15, 30);
    return initialTime;
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showNotificationHint, setShowNotificationHint] = useState(true);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const audioRef = useRef(null);
  
  const EVENT_DURATION = 21 * 60 * 1000; // 21 dakika

  useEffect(() => {
    const handleKeyDown = (e) => {
      const newPressedKeys = new Set([...pressedKeys, e.key]);
      setPressedKeys(newPressedKeys);
      
      // Ctrl+Alt+M kontrolü
      if (ADMIN_KEYS.every(key => {
        const keyMap = {
          'Control': 'Control',
          'Alt': 'Alt',
          'M': 'm'
        };
        return newPressedKeys.has(keyMap[key] || key);
      })) {
        e.preventDefault(); // Tarayıcı varsayılan davranışını engelle
        setShowAdminLogin(prev => !prev);
        setPressedKeys(new Set());
      }
    };

    const handleKeyUp = (e) => {
      setPressedKeys(prev => {
        const updated = new Set([...prev]);
        updated.delete(e.key);
        return updated;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pressedKeys]);

  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Ih3hY...');
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (referenceTime) {
      localStorage.setItem('referenceTime', referenceTime.toISOString());
    }
  }, [referenceTime]);

  const getTimeUntilNextEvent = () => {
    const now = currentTime.getTime();
    const reference = referenceTime.getTime();
    const timeSinceReference = (now - reference) % EVENT_DURATION;
    return EVENT_DURATION - timeSinceReference;
  };

  const formatTimeLeft = () => {
    const milliseconds = getTimeUntilNextEvent();
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getNextEventTime = () => {
    const now = currentTime.getTime();
    const timeUntilNext = getTimeUntilNextEvent();
    return new Date(now + timeUntilNext);
  };

  const formatNextEventTime = () => {
    const nextEvent = getNextEventTime();
    const minutes = nextEvent.getMinutes();
    return `XX:${minutes.toString().padStart(2, '0')}`;
  };

  const handleEnableNotifications = async () => {
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');
    setShowNotificationHint(false);
  };

  useEffect(() => {
    if (!notificationsEnabled) return;

    const timeLeft = getTimeUntilNextEvent() / 1000;
    
    NOTIFICATION_TIMES.forEach(notificationTime => {
      if (Math.floor(timeLeft) === notificationTime) {
        audioRef.current.play().catch(error => console.log('Audio play failed:', error));
        
        if (Notification.permission === 'granted') {
          new Notification('Event Timer', {
            body: notificationTime === 0 
              ? 'Event has started!' 
              : `Event starts in ${notificationTime} seconds`,
            icon: '/favicon.ico'
          });
        }
      }
    });
  }, [currentTime, notificationsEnabled]);

  const handlePasswordSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setPassword('');
    } else {
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 flex flex-col items-center justify-center">
      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/30">
        <div className="text-center space-y-8">
          <div className="space-y-2">
            <div className="text-3xl font-light text-gray-400 mb-1">
              ⟨ Next Session ⟩
            </div>
            <div className="text-7xl font-bold tracking-wider text-white mb-2 font-mono">
              {formatNextEventTime()}
            </div>
            <div className="text-2xl font-light text-gray-400">
              {formatTimeLeft()} until start
            </div>
          </div>

          {!notificationsEnabled && (
            <div className="space-y-4">
              {showNotificationHint && (
                <div className="bg-blue-500/20 p-4 rounded-lg flex items-center gap-3 text-blue-200">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">
                    Enable notifications to receive alerts before each session
                  </p>
                </div>
              )}
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 p-4 rounded-lg flex items-center justify-center gap-3 transition-all transform hover:scale-102 active:scale-98"
                onClick={handleEnableNotifications}
              >
                <Bell className="w-5 h-5" />
                <span className="font-medium">Enable Notifications</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showAdminLogin && (
        <div className="fixed top-0 right-0 m-4 p-4 bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700/50">
          <input
            type="password"
            placeholder="Admin password"
            className="w-full p-2 rounded bg-gray-700 text-white mb-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            autoFocus
          />
        </div>
      )}

      {isAdmin && (
        <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Settings</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <label className="block text-sm font-medium mb-2">
                Reference Time
              </label>
              <input
                type="datetime-local"
                className="w-full p-2 rounded bg-gray-700 text-white"
                value={referenceTime.toISOString().slice(0, 16)}
                onChange={(e) => setReferenceTime(new Date(e.target.value))}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default EventTimer;
