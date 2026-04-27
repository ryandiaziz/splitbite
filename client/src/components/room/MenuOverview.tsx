import React from 'react';

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
      <h2 className="text-lg font-bold text-slate-800 mb-4">Menu Overview</h2>
      
      {uploadingMenu ? (
        <div className="aspect-video bg-indigo-50 rounded-xl border-2 border-indigo-300 flex flex-col items-center justify-center text-indigo-500 animate-pulse">
          <svg className="animate-spin h-8 w-8 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-semibold text-sm">Uploading menu...</span>
        </div>
      ) : menuImageUrl ? (
        <div className="relative group cursor-zoom-in" onClick={onShowLightbox}>
          <img
            src={menuImageUrl}
            alt="Menu"
            className="w-full rounded-xl border border-slate-200 object-contain max-h-[480px] transition-transform hover:scale-[1.01]"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="bg-white/90 px-4 py-2 rounded-full text-xs font-bold shadow-lg">Click to Preview</span>
          </div>
        </div>
      ) : isHost ? (
        <div
          onClick={onUploadClick}
          className="aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all duration-200"
        >
          <span className="text-3xl mb-2">📷</span>
          <span className="font-semibold text-sm">Click to upload menu photo</span>
          <span className="text-xs mt-1 opacity-70">Max 1 MB • PNG, JPG, WebP</span>
        </div>
      ) : (
        <div className="aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
          <span className="text-sm italic">Waiting for host to upload menu...</span>
        </div>
      )}

      {/* Menu description */}
      {menuDescription && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">📝 Notes from Host</p>
          <p className="text-sm text-amber-900 whitespace-pre-wrap">{menuDescription}</p>
        </div>
      )}
    </div>
  );
};
