import React, { useState } from 'react';
import { Image, Video, FileText, Download, Eye, X } from 'lucide-react';

const EvidenceGallery = ({ evidence }) => {
  const [activeMedia, setActiveMedia] = useState(null);

  if (!evidence || evidence.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-gray bg-navy-medium/30 rounded-lg border border-dashed border-navy-border font-mono">
        NO DIGITAL EVIDENCE UPLOADED ON THIS FILE.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {evidence.map((item, index) => {
          const isImage = item.type === 'image';
          const isVideo = item.type === 'video';

          return (
            <div
              key={index}
              className="group relative rounded-lg border border-navy-border overflow-hidden bg-navy-medium/40 flex flex-col h-28 md:h-32 shadow-sm hover:border-navy-light transition"
            >
              {/* Media Thumbnail */}
              <div className="flex-1 w-full relative overflow-hidden bg-navy-dark flex items-center justify-center">
                {isImage ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : isVideo ? (
                  <div className="flex flex-col items-center text-slate-light">
                    <Video className="h-6 w-6 text-safety-amber" />
                    <span className="text-[9px] mt-1 uppercase font-mono">Video File</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-light">
                    <FileText className="h-6 w-6 text-blue-400" />
                    <span className="text-[9px] mt-1 uppercase font-mono">Document</span>
                  </div>
                )}

                {/* Hover overlay actions */}
                <div className="absolute inset-0 bg-navy-dark/60 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center space-x-2">
                  {(isImage || isVideo) && (
                    <button
                      onClick={() => setActiveMedia(item)}
                      className="p-1.5 bg-navy-light text-black rounded-full hover:bg-[#C5933E] transition"
                      title="Preview Media"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <a
                    href={item.url}
                    download={item.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-navy-light text-black rounded-full hover:bg-[#C5933E] transition"
                    title="Download Original"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Title / Description */}
              <div className="bg-navy-medium px-2 py-1 text-[10px] border-t border-navy-border flex items-center justify-between">
                <span className="truncate text-slate-300 font-mono flex-1">{item.name}</span>
                {isImage && <Image className="h-3 w-3 text-slate-gray ml-1 shrink-0" />}
                {isVideo && <Video className="h-3 w-3 text-slate-gray ml-1 shrink-0" />}
                {!isImage && !isVideo && <FileText className="h-3 w-3 text-slate-gray ml-1 shrink-0" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox / Preview Modal */}
      {activeMedia && (
        <div className="fixed inset-0 z-[9999] bg-navy-dark/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-navy-medium border border-navy-border rounded-xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-navy-border bg-navy-medium">
              <span className="text-xs font-mono text-slate-light truncate max-w-lg">{activeMedia.name}</span>
              <button
                onClick={() => setActiveMedia(null)}
                className="p-1 rounded-full text-slate-light hover:text-white hover:bg-navy-light/20 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 flex items-center justify-center max-h-[70vh] bg-navy-dark">
              {activeMedia.type === 'image' ? (
                <img
                  src={activeMedia.url}
                  alt={activeMedia.name}
                  className="max-w-full max-h-[60vh] object-contain rounded"
                />
              ) : (
                <video
                  src={activeMedia.url}
                  controls
                  className="max-w-full max-h-[60vh] object-contain rounded"
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 border-t border-navy-border bg-navy-medium flex justify-end">
              <a
                href={activeMedia.url}
                download={activeMedia.name}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-navy-light hover:bg-[#C5933E] text-xs font-bold rounded text-black transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>DOWNLOAD ORIGINAL</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceGallery;