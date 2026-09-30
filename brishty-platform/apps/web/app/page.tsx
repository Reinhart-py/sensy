"use client";

import React, { useState } from 'react';
import { Check, X, FileText, Search, ZoomIn, ZoomOut, Save, MessageSquare, Send } from 'lucide-react';

export default function VisualReviewScreen() {
  const [activeField, setActiveField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'fields' | 'chat'>('fields');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: 'Hi! I can help you find information in this invoice or verify the extracted data. What would you like to know?' }
  ]);

  // Mock extracted fields
  const fields = [
    { id: 'invoice_number', label: 'Invoice Number', value: 'INV-2023-0891', confidence: 0.98 },
    { id: 'vendor_name', label: 'Vendor Name', value: 'Acme Corp', confidence: 0.95 },
    { id: 'date', label: 'Date', value: '2023-10-15', confidence: 0.99 },
    { id: 'total', label: 'Total Amount', value: '$4,520.00', confidence: 0.82 },
    { id: 'tax', label: 'Tax', value: '$452.00', confidence: 0.91 },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    // Add user message
    setChatHistory([...chatHistory, { role: 'user', text: chatMessage }]);
    setChatMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        text: 'Based on the document, the total amount is $4,520.00 and it includes $452.00 in tax. Let me know if you need any other details verified!' 
      }]);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* Left: Thumbnail Rail */}
      <div className="w-24 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-4 shadow-sm z-10">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pages</div>
        {[1, 2, 3].map((page) => (
          <div 
            key={page} 
            className={`w-16 h-20 bg-gray-50 border-2 rounded cursor-pointer transition-all flex flex-col items-center justify-center ${page === 1 ? 'border-brand-500 shadow-md ring-2 ring-brand-100' : 'border-gray-200 hover:border-brand-300'}`}
          >
            <FileText size={20} className="text-gray-400" />
            <div className="text-xs mt-1 text-gray-600 font-medium">Pg {page}</div>
          </div>
        ))}
      </div>

      {/* Center: Main PDF Viewer */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Toolbar */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="font-semibold text-gray-800 flex items-center">
            <span className="bg-brand-100 text-brand-700 p-1.5 rounded-md mr-3">
              <FileText size={18} />
            </span>
            INV-2023-0891.pdf
          </div>
          <div className="flex items-center space-x-3 text-gray-500">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ZoomOut size={18} /></button>
            <span className="text-sm font-medium">100%</span>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ZoomIn size={18} /></button>
          </div>
        </div>
        
        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-gray-200 p-8 flex justify-center items-start">
          <div className="bg-white w-[800px] h-[1131px] shadow-2xl relative">
            {/* Mock PDF Content */}
            <div className="p-16 border-b border-gray-100 flex justify-between items-start">
               <div>
                 <h1 className="text-4xl font-bold text-gray-800">INVOICE</h1>
                 <p className="text-gray-500 mt-2">Acme Corp</p>
               </div>
               <div className="text-right">
                 <p className="text-gray-600 font-medium">Date: 2023-10-15</p>
                 <p className="text-gray-600 font-medium mt-1">Invoice #: INV-2023-0891</p>
               </div>
            </div>
            
            {/* Dynamic Highlight Overlay */}
            {activeTab === 'fields' && activeField === 'invoice_number' && (
              <div className="absolute top-[88px] right-[60px] w-40 h-8 border-2 border-brand-500 bg-brand-500/20 rounded z-20 pointer-events-none animate-pulse shadow-[0_0_15px_rgba(20,184,166,0.5)]"></div>
            )}
            {activeTab === 'fields' && activeField === 'vendor_name' && (
              <div className="absolute top-[100px] left-[60px] w-28 h-8 border-2 border-brand-500 bg-brand-500/20 rounded z-20 pointer-events-none animate-pulse shadow-[0_0_15px_rgba(20,184,166,0.5)]"></div>
            )}
             {activeTab === 'fields' && activeField === 'total' && (
              <div className="absolute bottom-[200px] right-[60px] w-32 h-10 border-2 border-orange-500 bg-orange-500/20 rounded z-20 pointer-events-none animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Review & Chat Panel */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-xl z-20">
        
        {/* Panel Header & Tabs */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="p-5 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Document Actions</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">Review Pending</span>
          </div>
          <div className="flex border-t border-gray-200">
            <button 
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'fields' ? 'text-brand-600 border-b-2 border-brand-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('fields')}
            >
              <FileText size={16} /> Data Fields
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'chat' ? 'text-brand-600 border-b-2 border-brand-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquare size={16} /> Ask AI (RAG)
            </button>
          </div>
        </div>
        
        {/* Fields Tab Content */}
        {activeTab === 'fields' && (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {fields.map((field) => (
                <div 
                  key={field.id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${activeField === field.id ? 'border-brand-500 bg-brand-50 shadow-md ring-1 ring-brand-500' : 'border-gray-200 hover:border-brand-200 hover:bg-gray-50'}`}
                  onClick={() => setActiveField(field.id)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{field.label}</label>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${field.confidence > 0.9 ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></div>
                      <span className={`text-xs font-medium ${field.confidence > 0.9 ? 'text-green-600' : 'text-orange-600'}`}>
                        {(field.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    defaultValue={field.value}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm"
                  />
                </div>
              ))}
            </div>
            
            <div className="p-5 border-t border-gray-200 bg-gray-50 space-y-3">
              <button className="w-full flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-medium transition-colors shadow-md shadow-brand-500/20">
                <Check size={18} />
                <span>Approve Document</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium transition-colors shadow-sm">
                <Save size={18} />
                <span>Save Draft</span>
              </button>
            </div>
          </>
        )}

        {/* Chat Tab Content */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      {msg.role === 'user' ? 'You' : 'Sensy AI'}
                    </span>
                  </div>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-brand-600 text-white rounded-br-sm' 
                      : 'bg-white border border-gray-200 text-gray-800 shadow-sm rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="relative">
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask a question about this document..."
                  className="w-full bg-gray-100 border-transparent rounded-xl pl-4 pr-12 py-3 text-sm focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
                <button 
                  type="submit"
                  disabled={!chatMessage.trim()}
                  className="absolute right-2 top-2 p-1.5 bg-brand-600 text-white rounded-lg disabled:bg-gray-300 hover:bg-brand-700 transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
              <div className="text-center mt-3">
                <p className="text-[10px] text-gray-400">Sensy AI uses RAG to query document contents accurately.</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}
