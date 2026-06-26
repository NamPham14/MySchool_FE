import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, Search, Image as ImageIcon, Paperclip, Smile, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGetConversationsQuery, useGetMessagesQuery, useSendMessageMutation } from '../store/api/academicApi';

const ChatPage = () => {
  const { user } = useAuth();
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lấy danh sách conversation từ API
  const { data: convData, isLoading: isConvLoading } = useGetConversationsQuery(undefined, { pollingInterval: 5000 });
  const conversations = convData?.data || [];

  // Lấy tin nhắn của conversation hiện tại (Polling mỗi 2 giây để giả lập realtime)
  const { data: msgData, isLoading: isMsgLoading } = useGetMessagesQuery(
    selectedConv?.id as number, 
    { 
      skip: !selectedConv?.id,
      pollingInterval: 2000 // Polling thay cho WebSocket
    }
  );
  
  const [sendMessage] = useSendMessageMutation();
  const messages = msgData?.data || [];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConv]);

  // Set default conversation
  useEffect(() => {
    if (conversations.length > 0 && !selectedConv) {
      setSelectedConv(conversations[0]);
    }
  }, [conversations, selectedConv]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConv) return;
    
    const content = messageInput;
    setMessageInput('');

    try {
      await sendMessage({ conversationId: selectedConv.id, content }).unwrap();
    } catch (err) {
        console.error("Lỗi gửi tin nhắn:", err);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-sm border border-gray-100 flex overflow-hidden">
      {/* Sidebar - Conversations List */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/30">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tin nhắn</h2>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm kiếm cuộc trò chuyện..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv: any) => (
            <div 
              key={conv.id}
              onClick={() => setSelectedConv(conv)}
              className={`flex items-center p-4 cursor-pointer border-b border-gray-50 transition-colors ${
                selectedConv?.id === conv.id ? 'bg-orange-50/50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(conv.name || 'Chat')}&background=${conv.type === 'GROUP' ? 'f97316' : 'e2e8f0'}&color=${conv.type === 'GROUP' ? 'fff' : '475569'}`} alt={conv.name} className="w-12 h-12 rounded-full object-cover" />
                {conv.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              
              <div className="ml-3 flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`font-semibold text-sm truncate ${selectedConv?.id === conv.id ? 'text-orange-900' : 'text-gray-900'}`}>
                    {conv.name}
                  </h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                    {conv.lastUpdated ? new Date(conv.lastUpdated).toLocaleDateString('vi-VN') : ''}
                  </span>
                </div>
                <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                  {conv.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white">
          {selectedConv && (
            <div className="flex items-center">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConv.name || 'Chat')}&background=${selectedConv.type === 'GROUP' ? 'f97316' : 'e2e8f0'}&color=${selectedConv.type === 'GROUP' ? 'fff' : '475569'}`} alt={selectedConv.name} className="w-10 h-10 rounded-full mr-3" />
              <div>
                <h2 className="font-bold text-gray-900">{selectedConv.name}</h2>
                <p className="text-xs text-orange-500 font-medium">Đang hoạt động</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-4 text-gray-400">
            <button className="hover:text-orange-500 transition-colors p-2 rounded-full hover:bg-orange-50"><Phone className="w-5 h-5" /></button>
            <button className="hover:text-orange-500 transition-colors p-2 rounded-full hover:bg-orange-50"><Video className="w-5 h-5" /></button>
            <button className="hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50/30">
          {messages.map((msg: any) => {
            const currentUserId = (user as any)?.data?.id || user?.id;
            const isMe = String(msg.senderId) === String(currentUserId);
            const timeStr = msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
            return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && (
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName || 'U')}&background=e2e8f0&color=475569`} 
                  alt={msg.senderName} 
                  title={msg.senderName}
                  className="w-8 h-8 rounded-full mr-2 self-end mb-1" 
                />
              )}
              
              <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && selectedConv?.type === 'GROUP' && (
                  <span className="text-[11px] text-gray-500 mb-0.5 ml-1">{msg.senderName}</span>
                )}
                <div 
                  className={`px-4 py-2.5 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
                    isMe 
                      ? 'bg-orange-500 text-white rounded-br-sm' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                  }`}
                  style={{ wordBreak: 'break-word' }}
                >
                  {msg.content}
                </div>
                <div className={`flex items-center text-[11px] text-gray-400 mt-1`}>
                  {timeStr}
                  {isMe && <CheckCheck className="w-3.5 h-3.5 ml-1 text-orange-500" />}
                </div>
              </div>
            </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <div className="flex items-center space-x-1 text-gray-400 pb-2">
              <button type="button" className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Paperclip className="w-5 h-5" /></button>
              <button type="button" className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ImageIcon className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="w-full bg-gray-100 border-none rounded-2xl pl-4 pr-10 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <Smile className="w-5 h-5" />
              </button>
            </div>
            
            <button 
              type="submit" 
              disabled={!messageInput.trim()}
              className="p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
