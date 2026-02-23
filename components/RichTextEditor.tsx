
import React from 'react';
import { Bold, Italic, List, Link as LinkIcon, Heading1, Heading2, Quote, Code, Image } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    height?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, height = "h-64" }) => {
    
    // Helper to insert markdown syntax
    const insertFormat = (startTag: string, endTag: string = '') => {
        const textarea = document.getElementById('rte-textarea') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        const newText = before + startTag + selection + endTag + after;
        onChange(newText);
        
        // Reset focus (rough approximation)
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + startTag.length, end + startTag.length);
        }, 0);
    };

    return (
        <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-100 bg-slate-50">
                <button type="button" onClick={() => insertFormat('## ')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="Heading 1"><Heading1 size={16}/></button>
                <button type="button" onClick={() => insertFormat('### ')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="Heading 2"><Heading2 size={16}/></button>
                <div className="w-px h-4 bg-slate-300 mx-1"></div>
                <button type="button" onClick={() => insertFormat('**', '**')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="Bold"><Bold size={16}/></button>
                <button type="button" onClick={() => insertFormat('*', '*')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="Italic"><Italic size={16}/></button>
                <div className="w-px h-4 bg-slate-300 mx-1"></div>
                <button type="button" onClick={() => insertFormat('- ')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="List"><List size={16}/></button>
                <button type="button" onClick={() => insertFormat('> ')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="Quote"><Quote size={16}/></button>
                <button type="button" onClick={() => insertFormat('`', '`')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="Code"><Code size={16}/></button>
                <div className="w-px h-4 bg-slate-300 mx-1"></div>
                <button type="button" onClick={() => insertFormat('[Link Text](url)')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="Link"><LinkIcon size={16}/></button>
                <button type="button" onClick={() => insertFormat('![Image Alt](url)')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="Image"><Image size={16}/></button>
            </div>
            
            {/* Editor Area */}
            <textarea
                id="rte-textarea"
                className={`w-full p-4 bg-white text-slate-700 outline-none resize-none font-mono text-sm ${height}`}
                placeholder={placeholder || "請在此輸入內容..."}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            
            <div className="px-3 py-1 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-right">
                支援 Markdown 語法
            </div>
        </div>
    );
};
