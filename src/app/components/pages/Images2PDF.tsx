"use client";

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FiDownload, FiLoader, FiUpload, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function Images2PDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    const validFiles = uploadedFiles.filter(file => 
      /\.(jpe?g|png|gif)$/i.test(file.name)
    );

    if (validFiles.length !== uploadedFiles.length) {
      toast.error('Some files were not added due to unsupported format');
    }

    setFiles(validFiles);
  };

  const convertToPdf = async () => {
    if (files.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsConverting(true);
    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const imageBytes = await file.arrayBuffer();
        let image;

        if (file.type.includes('jpeg') || file.type.includes('jpg')) {
          image = await pdfDoc.embedJpg(imageBytes);
        } else if (file.type.includes('png')) {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          continue;
        }

        const page = pdfDoc.addPage();
        const { width: pageWidth, height: pageHeight } = page.getSize();
        const scaleFactor = Math.min(
          pageWidth / image.width, 
          pageHeight / image.height
        ) * 0.8;

        page.drawImage(image, {
          x: (pageWidth - image.width * scaleFactor) / 2,
          y: (pageHeight - image.height * scaleFactor) / 2,
          width: image.width * scaleFactor,
          height: image.height * scaleFactor
        });
      }

      const pdfBytes = await pdfDoc.save();
      const pdfUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
      setPdfUrl(pdfUrl);
      toast.success('PDF created successfully!');
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error('Failed to convert images to PDF');
    } finally {
      setIsConverting(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setPdfUrl(null);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
  };

  return (
      <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-md space-y-6">
        <div className="border-2 border-dashed border-blue-200 rounded-lg p-4">
          <input 
            type="file" 
            multiple
            accept="image/jpeg,image/png,image/gif"
            onChange={handleFileUpload}
            className="hidden" 
            id="fileUpload"
            disabled={isConverting}
          />
          <label 
            htmlFor="fileUpload" 
            className={`cursor-pointer flex flex-col items-center space-y-2 text-blue-500 
                       hover:text-blue-700 ${isConverting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FiUpload className="w-12 h-12" />
            <span className="font-semibold">Upload Image(s)</span>
          </label>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center bg-blue-50 p-2 rounded"
                >
                  <span className="text-sm truncate flex-1 mr-2">{file.name}</span>
                  <button 
                    onClick={() => setFiles(files.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-700"
                    disabled={isConverting}
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {files.length > 0 && !pdfUrl && (
          <button 
            onClick={convertToPdf}
            disabled={isConverting}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 
                     disabled:bg-gray-300 disabled:cursor-not-allowed 
                     transition-colors flex items-center justify-center gap-2"
          >
            {isConverting ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                Converting...
              </>
            ) : (
              'Convert to PDF'
            )}
          </button>
        )}

        {pdfUrl && (
          <div className="flex flex-col space-y-2 items-center">
            <a 
              href={pdfUrl}
              download="converted.pdf"
              className="text-green-600 hover:text-green-700 flex items-center gap-2"
            >
              <FiDownload className="w-5 h-5" /> Download PDF
            </a>
            <button 
              onClick={reset}
              className="text-blue-600 hover:text-blue-700"
            >
              Convert New Images
            </button>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center">
          Supports JPG, PNG, GIF
        </p>
      </div>
  );
}