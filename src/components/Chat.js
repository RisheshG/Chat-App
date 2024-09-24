import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firestore } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import './Chat.css';

function Chat() {
  const { currentUser } = useAuth();
  const [newContact, setNewContact] = useState('');
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showAddContact, setShowAddContact] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      const contactsRef = doc(firestore, 'contacts', currentUser.uid);
      const docSnap = await getDoc(contactsRef);

      if (docSnap.exists()) {
        setContacts(docSnap.data().contacts);
      } else {
        setContacts([]);
      }
    };

    fetchContacts();
  }, [currentUser.uid]);

  useEffect(() => {
    if (selectedContact) {
      const messagesRef = collection(
        firestore,
        'messages',
        currentUser.email < selectedContact.email ? `${currentUser.email}_${selectedContact.email}` : `${selectedContact.email}_${currentUser.email}`,
        'chats'
      );

      const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Sort messages by createdAt timestamp in ascending order (most recent at bottom)
        msgs.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
        
        setMessages(msgs);
      });

      return () => unsubscribe();
    }
  }, [selectedContact, currentUser.email]);

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (newContact.trim()) {
      const contactEmail = newContact.trim();
      const existingContact = contacts.find(contact => contact.email === contactEmail);

      if (existingContact) {
        setError('This contact is already in your contacts list.');
        return;
      }

      try {
        const contactsRef = doc(firestore, 'contacts', currentUser.uid);
        const docSnap = await getDoc(contactsRef);

        const updatedContacts = docSnap.exists()
          ? [...docSnap.data().contacts, { email: contactEmail }]
          : [{ email: contactEmail }];

        await setDoc(contactsRef, { contacts: updatedContacts });
        setContacts(updatedContacts); // Update state immediately
        setNewContact('');
        setError('');
        setShowAddContact(false);
      } catch (error) {
        setError(`Error adding contact: ${error.message}`);
      }
    } else {
      setError('Please enter a valid email address.');
    }
  };

  const handleCancelAddContact = () => {
    setNewContact('');
    setError('');
    setShowAddContact(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (message.trim() && selectedContact) {
      try {
        const messagesRef = collection(
          firestore,
          'messages',
          currentUser.email < selectedContact.email ? `${currentUser.email}_${selectedContact.email}` : `${selectedContact.email}_${currentUser.email}`,
          'chats'
        );

        await addDoc(messagesRef, {
          text: message,
          createdAt: Timestamp.fromDate(new Date()),
          user: currentUser.email,
        });
        setMessage('');
      } catch (error) {
        setError(`Error sending message: ${error.message}`);
      }
    } else {
      setError('Please select a contact and enter a message.');
    }
  };

  const handleDeleteContact = async (email) => {
    try {
      const contactsRef = doc(firestore, 'contacts', currentUser.uid);
      const docSnap = await getDoc(contactsRef);

      if (docSnap.exists()) {
        const updatedContacts = docSnap.data().contacts.filter(contact => contact.email !== email);
        await setDoc(contactsRef, { contacts: updatedContacts });
        setContacts(updatedContacts); // Update state immediately
      }
    } catch (error) {
      setError(`Error deleting contact: ${error.message}`);
    }
  };

  return (
    <div className="chat-container">
      <div className="contacts">
        <div className="contacts-header">
          <h2>Contacts</h2>
          <button onClick={() => setShowAddContact(!showAddContact)} className="add-contact-button">
            Add Contact
          </button>
        </div>
        {showAddContact && (
          <form onSubmit={handleAddContact} className="add-contact-form">
            <input
              type="text"
              value={newContact}
              onChange={(e) => setNewContact(e.target.value)}
              placeholder="Add contact email..."
              className="contact-input"
            />
            <button type="submit" className="submit-button">Add</button>
            <button type="button" onClick={handleCancelAddContact} className="cancel-button">Cancel</button>
            {error && <p className="error-message">{error}</p>}
          </form>
        )}
        <div className="contact-list">
          {contacts.length === 0 ? (
            <p>No contacts added yet.</p>
          ) : (
            contacts.map((contact) => (
              <div key={contact.email} className="contact-card">
                <span
                  onClick={() => setSelectedContact(contact)}
                  className={`contact-name ${selectedContact?.email === contact.email ? 'active' : ''}`}
                >
                  {contact.email}
                </span>
                <button
                  onClick={() => handleDeleteContact(contact.email)}
                  className="delete-button"
                  aria-label="Delete contact"
                  style={{ position: 'absolute', top: '5px', right: '5px', fontSize: '16px' }} // Style the delete button
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedContact && (
        <div className="chat-window">
          <h2>Chat with {selectedContact.email}</h2>
          <div className="messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.user === currentUser.email ? 'own' : 'other'}`}
              >
                <span className="message-sender">{msg.user}: </span>
                <span className="message-text">{msg.text}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="send-message-form">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="message-input"
            />
            <button type="submit" className="send-button">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chat;
