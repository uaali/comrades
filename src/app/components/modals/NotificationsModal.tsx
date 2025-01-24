import { Notification } from "@/types";
import { Modal } from "flowbite-react";
import { MdMarkChatRead, MdNotificationsNone, MdDelete } from "react-icons/md";
import { useEffect, useState } from "react";
import Link from "next/link";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onDelete: (id: string) => void;
  onToggleRead: (id: string, read: boolean) => void;
  onMarkAllRead: () => void;
  onDeleteMultiple: (ids: string[]) => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onDelete,
  onToggleRead,
  onMarkAllRead,
  onDeleteMultiple,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sort notifications: unread first, then by most recent date
  const sortedNotifications = [...notifications].sort((a, b) => {
    // First, prioritize unread notifications
    if (a.read !== b.read) {
      return a.read ? 1 : -1;
    }

    // If both have same read status, sort by timestamp (most recent first)
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    onDeleteMultiple(selectedIds);
    setSelectedIds([]); // Clear selection after deletion
  };

  useEffect(() => {
    if (isOpen) {
      notifications.forEach((notification) => {
        if (!notification.link && !notification.read) {
          onToggleRead(notification.id, notification.read);
        }
      });
    }
  }, [isOpen]);

  return (
    <Modal show={isOpen} onClose={onClose}>
      <Modal.Header>
        <div className="flex items-center space-x-2">
          <MdNotificationsNone className="w-6 h-6" />
          <p>Notifications</p>
        </div>
      </Modal.Header>
      <Modal.Body>
        {sortedNotifications.length > 0 && (
          <div className="flex justify-end mb-3">
            <button className="text-blue-500 text-sm" onClick={onMarkAllRead}>
              Mark all as Read
            </button>
          </div>
        )}
        {sortedNotifications.length === 0 ? (
          <div className="text-center text-gray-500">No notifications</div>
        ) : (
          <div className="space-y-4">
            {sortedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg ${
                  notification.read
                    ? "bg-gray-100"
                    : "bg-blue-50 border-l-4 border-primary-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(notification.id)}
                      onChange={() => handleSelect(notification.id)}
                      className="form-checkbox"
                    />
                    <h3 className="font-semibold">{notification.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <button
                        onClick={() =>
                          onToggleRead(notification.id, notification.read)
                        }
                      >
                        <MdMarkChatRead className="text-primary-200" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(notification.id)}
                      title="Delete"
                    >
                      <MdDelete className="text-red-500" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400 mt-2 block">
                    {notification.timestamp.toLocaleString()}
                  </p>
                  {notification.link && (
                    <Link
                      onClick={() => {
                        if (!notification.read) {
                          onToggleRead(notification.id, notification.read);
                        }
                        onClose();
                      }}
                      href={notification.link}
                      className="text-blue-500 underline underline-offset-1 text-sm"
                    >
                      Click here
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
      {selectedIds.length > 0 && (
        <div className="p-3">
          <button
            onClick={handleDeleteSelected}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
          >
            Delete Selected
          </button>
        </div>
      )}
      <Modal.Footer>
        <button
          onClick={onClose}
          className="w-full bg-primary-200 text-white py-2 rounded-lg hover:bg-primary-300 transition"
        >
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default NotificationsModal;
