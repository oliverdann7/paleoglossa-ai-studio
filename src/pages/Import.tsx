import { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, FileText, Link as LinkIcon, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Import = () => {
  const [activeTab, setActiveTab] = useState<'text' | 'file' | 'url'>('text');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleImport = () => {
    // Make dummy import logic clear input
    setContent('');
    setTitle('');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 md:px-12 font-sans min-h-screen">
      <div className="mb-10">
        <h1 className="text-[32px] font-serif font-light tracking-tight mb-3 text-ink">Import Text</h1>
        <p className="font-body text-[15px] italic text-ink2 leading-relaxed max-w-2xl">
            Bring in your own reading material to study. We currently support all texts written in Egyptian Hieroglyphs, Akkadian, Vedic Sanskrit, Ancient Greek, Koine Greek, Biblical Hebrew, Aramaic, Classical Latin, Classical Syriac, Coptic, and Hittite.
        </p>
      </div>

      {isSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-jadexl text-jade border border-jade/20 rounded font-medium flex items-center justify-center gap-2 shadow-sm text-[13px]"
        >
          Text imported successfully! You can find it in your Library.
        </motion.div>
      )}

      <div className="card p-8 mb-8">
        <div className="flex gap-2 mb-8 border-b border-bdr pb-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('text')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded text-[13px] font-medium transition-colors whitespace-nowrap",
              activeTab === 'text' 
                ? "bg-bluexl text-blue border border-blue/20" 
                : "text-ink3 hover:text-ink hover:bg-parch2"
            )}
          >
            <Type className="w-4 h-4" />
            Paste Text
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={cn(
               "flex items-center gap-2 px-4 py-2 rounded text-[13px] font-medium transition-colors whitespace-nowrap",
               activeTab === 'file' 
                 ? "bg-bluexl text-blue border border-blue/20" 
                 : "text-ink3 hover:text-ink hover:bg-parch2"
            )}
          >
            <FileText className="w-4 h-4" />
            Upload File
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={cn(
               "flex items-center gap-2 px-4 py-2 rounded text-[13px] font-medium transition-colors whitespace-nowrap",
               activeTab === 'url' 
                 ? "bg-bluexl text-blue border border-blue/20" 
                 : "text-ink3 hover:text-ink hover:bg-parch2"
            )}
          >
            <LinkIcon className="w-4 h-4" />
            From URL
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="eyebrow block px-1">Title</label>
            <input 
              type="text" 
              placeholder="e.g. Moby Dick, Chapter 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-bdr rounded-[8px] text-[13px] font-sans focus:outline-none focus:border-blue transition-colors shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
             <div className="space-y-2">
              <label className="eyebrow block px-1">Language</label>
              <select className="w-full px-4 py-3 bg-white border border-bdr rounded-[8px] text-[13px] font-sans focus:outline-none focus:border-blue transition-colors shadow-sm appearance-none">
                <option value="egyptian">Egyptian Hieroglyphs</option>
                <option value="akkadian">Akkadian</option>
                <option value="sanskrit">Vedic Sanskrit</option>
                <option value="greek">Ancient Greek</option>
                <option value="koine">Koine Greek</option>
                <option value="hebrew">Biblical Hebrew</option>
                <option value="aramaic">Aramaic</option>
                <option value="latin">Classical Latin</option>
                <option value="syriac">Classical Syriac</option>
                <option value="coptic">Coptic</option>
                <option value="hittite">Hittite</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="eyebrow block px-1">Level (Optional)</label>
              <select className="w-full px-4 py-3 bg-white border border-bdr rounded-[8px] text-[13px] font-sans focus:outline-none focus:border-blue transition-colors shadow-sm appearance-none">
                <option value="">Any</option>
                <option value="A1">Beginner (A1)</option>
                <option value="A2">Elementary (A2)</option>
                <option value="B1">Intermediate (B1)</option>
                <option value="B2">Upper Intermediate (B2)</option>
                <option value="C1">Advanced (C1)</option>
                <option value="C2">Mastery (C2)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="eyebrow block px-1">Content</label>
            {activeTab === 'text' && (
              <textarea 
                placeholder="Paste your text here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full px-4 py-4 bg-white border border-bdr rounded-[8px] text-[14px] font-serif leading-[1.8] focus:outline-none focus:border-blue transition-colors shadow-sm resize-y"
              />
            )}
            
            {activeTab === 'file' && (
              <div className="border-2 border-dashed border-bdr rounded-xl py-24 flex flex-col items-center justify-center gap-4 bg-parch2 hover:bg-parch3 hover:border-blue transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-muted" />
                <div className="text-center space-y-1">
                  <p className="font-medium text-14px text-ink">Click to upload or drag and drop</p>
                  <p className="text-[12px] text-ink3 italic font-body">PDF, EPUB, TXT, or DOCX (max. 10MB)</p>
                </div>
              </div>
            )}

            {activeTab === 'url' && (
              <input 
                type="url" 
                placeholder="https://example.com/article"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-bdr rounded-[8px] text-[13px] font-sans focus:outline-none focus:border-blue transition-colors shadow-sm"
              />
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleImport}
            disabled={!title || (activeTab !== 'file' && !content)}
            className="btn-primary py-2.5 px-8 disabled:opacity-50"
          >
            Import Text
          </button>
        </div>
      </div>
    </div>
  );
};
