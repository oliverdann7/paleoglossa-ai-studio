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
    <div className="max-w-4xl mx-auto py-12 px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-serif font-bold tracking-tight mb-4">Import Text</h1>
        <p className="text-obsidian-900/60 dark:text-vellum-100/60">
            Bring in your own reading material to study. We currently support all texts written in Egyptian Hieroglyphs, Akkadian, Vedic Sanskrit, Ancient Greek, Koine Greek, Biblical Hebrew, Aramaic, Classical Latin, Classical Syriac, Coptic, and Hittite.
        </p>
      </div>

      {isSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          Text imported successfully! You can find it in your Library.
        </motion.div>
      )}

      <div className="bg-white dark:bg-obsidian-900 border border-black/5 dark:border-white/5 rounded-3xl p-8 mb-8 shadow-sm">
        <div className="flex gap-4 mb-8 border-b border-black/5 dark:border-white/5 pb-4">
          <button
            onClick={() => setActiveTab('text')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors",
              activeTab === 'text' 
                ? "bg-black/5 dark:bg-white/5" 
                : "text-obsidian-900/40 dark:text-vellum-100/40 hover:text-obsidian-900 dark:hover:text-vellum-100"
            )}
          >
            <Type className="w-4 h-4" />
            Paste Text
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors",
              activeTab === 'file' 
                ? "bg-black/5 dark:bg-white/5" 
                : "text-obsidian-900/40 dark:text-vellum-100/40 hover:text-obsidian-900 dark:hover:text-vellum-100"
            )}
          >
            <FileText className="w-4 h-4" />
            Upload File
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors",
              activeTab === 'url' 
                ? "bg-black/5 dark:bg-white/5" 
                : "text-obsidian-900/40 dark:text-vellum-100/40 hover:text-obsidian-900 dark:hover:text-vellum-100"
            )}
          >
            <LinkIcon className="w-4 h-4" />
            From URL
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold tracking-tight px-1">Title</label>
            <input 
              type="text" 
              placeholder="e.g. Moby Dick, Chapter 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-gold-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <label className="text-sm font-bold tracking-tight px-1">Language</label>
              <select className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-gold-500/50 appearance-none">
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
              <label className="text-sm font-bold tracking-tight px-1">Level (Optional)</label>
              <select className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-gold-500/50 appearance-none">
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
            <label className="text-sm font-bold tracking-tight px-1">Content</label>
            {activeTab === 'text' && (
              <textarea 
                placeholder="Paste your text here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 text-lg leading-relaxed rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-gold-500/50 resize-y"
              />
            )}
            
            {activeTab === 'file' && (
              <div className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl py-24 flex flex-col items-center justify-center gap-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:border-gold-500 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-black/40 dark:text-white/40" />
                <div className="text-center space-y-1">
                  <p className="font-bold">Click to upload or drag and drop</p>
                  <p className="text-sm text-obsidian-900/60 dark:text-vellum-100/60">PDF, EPUB, TXT, or DOCX (max. 10MB)</p>
                </div>
              </div>
            )}

            {activeTab === 'url' && (
              <input 
                type="url" 
                placeholder="https://example.com/article"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-gold-500/50"
              />
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleImport}
            disabled={!title || (activeTab !== 'file' && !content)}
            className="px-8 py-3 bg-obsidian-900 dark:bg-vellum-100 text-vellum-50 dark:text-obsidian-950 font-bold rounded-xl disabled:opacity-50 transition-opacity"
          >
            Import Text
          </button>
        </div>
      </div>
    </div>
  );
};
