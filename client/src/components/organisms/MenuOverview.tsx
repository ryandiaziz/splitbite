import React from 'react';
import { Camera, FileText, ZoomIn, Loader2 } from 'lucide-react';

interface MenuOverviewProps {
  menuImageUrl?: string;
  menuDescription?: string;
  isHost: boolean;
  uploadingMenu: boolean;
  onUploadClick: () => void;
  onShowLightbox: () => void;
}

export const MenuOverview: React.FC<MenuOverviewProps> = ({
  menuImageUrl,
  menuDescription,
  isHost,
  uploadingMenu,
  onUploadClick,
  onShowLightbox,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-none">Menu Overview</h2>
        {!menuImageUrl && !uploadingMenu && (
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Waiting for content</span>
        )}
      </div>
      
      {uploadingMenu ? (
        <div className="aspect-video bg-slate-50 rounded-2xl border-2 border-indigo-100 flex flex-col items-center justify-center text-indigo-500 animate-pulse">
          <Loader2 className="animate-spin h-8 w-8 mb-3 opacity-40" />
          <span className="font-bold text-[10px] uppercase tracking-widest">Uploading menu...</span>
        </div>
      ) : menuImageUrl ? (
        <div className="relative group cursor-zoom-in" onClick={onShowLightbox}>
          <img
            src={menuImageUrl}
            alt="Menu"
            className="w-full rounded-2xl border border-slate-100 object-contain max-h-[480px] transition-all duration-500 group-hover:brightness-[0.9] group-hover:shadow-xl"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="bg-white/90 backdrop-blur-sm px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-2xl border border-white/20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <ZoomIn className="w-4 h-4 text-indigo-600" />
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Preview Full Menu</span>
            </div>
          </div>
        </div>
      ) : isHost ? (
        <div
          onClick={onUploadClick}
          className="aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all duration-300 group"
        >
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-4 border border-slate-100 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
            <Camera className="w-8 h-8 opacity-40" />
          </div>
          <span className="font-bold text-[10px] uppercase tracking-widest">Click to upload menu photo</span>
          <span className="text-[9px] mt-2 opacity-50 uppercase tracking-widest font-bold">Max 5 MB • PNG, JPG, WebP</span>
        </div>
      ) : (
        <div className="aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
          <Camera className="w-10 h-10 mb-4 opacity-20" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Waiting for host to upload menu</span>
        </div>
      )}

      {/* Menu description */}
      {menuDescription && (
        <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/20 group-hover:bg-indigo-500 transition-colors" />
          <div className="flex items-center gap-2 mb-2">
             <FileText className="w-3.5 h-3.5 text-slate-400" />
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Host Notification</p>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">{menuDescription}</p>
        </div>
      )}
    </div>
  );
};
