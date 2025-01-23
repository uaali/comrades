"use client";

import React, { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FiDownload, FiFile, FiFileText, FiUpload, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function Images2PDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [convertedFile, setConvertedFile] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'convert' | 'download'>('upload'); // New state for managing steps

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    const validFiles = uploadedFiles.filter(file => 
      ['.jpg', '.jpeg', '.png', '.gif'].some(ext => 
        file.name.toLowerCase().endsWith(ext)
      )
    );

    if (validFiles.length !== uploadedFiles.length) {
      toast.error('Some files were not added due to unsupported format');
    }

    setFiles(validFiles);
    setStep('convert'); // Once files are uploaded, switch to convert step
  }, []);

  const removeFile = useCallback((fileToRemove: File) => {
    setFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
  }, []);

  const convertToPdf = async () => {
    if (files.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const imageBytes = await file.arrayBuffer();
        let image;

        // Detect and embed image type
        if (file.type.includes('jpeg') || file.type.includes('jpg')) {
          image = await pdfDoc.embedJpg(imageBytes);
        } else if (file.type.includes('png')) {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          toast.error(`Unsupported image type: ${file.name}`);
          continue;
        }

        // Create a page and draw the image
        const page = pdfDoc.addPage();
        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();

        // Calculate scaled image dimensions
        const scaleFactor = Math.min(
          pageWidth / image.width, 
          pageHeight / image.height
        );

        const scaledWidth = image.width * scaleFactor * 0.8;
        const scaledHeight = image.height * scaleFactor * 0.8;

        page.drawImage(image, {
          x: (pageWidth - scaledWidth) / 2,
          y: (pageHeight - scaledHeight) / 2,
          width: scaledWidth,
          height: scaledHeight
        });
      }

      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setConvertedFile(pdfUrl);

      setStep('download'); // After conversion, switch to download step
      toast.success('PDF created successfully!');
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error('Failed to convert images to PDF');
    }
  };

  const resetConverter = () => {
    setFiles([]);
    setConvertedFile(null);
    setStep('upload'); // Reset back to upload step
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">      
      <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-md space-y-6">
        <h1 className="text-xl md:text-2xl font-bold text-center text-blue-600 flex items-center justify-center gap-2 text-nowrap">
          <FiFileText className="w-8 h-8" /> Image(s) to PDF Converter
        </h1>
        
        {step === 'upload' && (
          <div className="border-2 border-dashed border-blue-200 rounded-lg p-4">
            <input 
              type="file" 
              multiple
              accept=".jpg,.jpeg,.png,.gif"
              onChange={handleFileUpload}
              className="hidden" 
              id="fileUpload"
            />
            <label 
              htmlFor="fileUpload" 
              className="cursor-pointer flex flex-col items-center space-y-2 text-blue-500 hover:text-blue-700"
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
                    <span className="text-sm">{file.name}</span>
                    <button 
                      onClick={() => removeFile(file)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'convert' && (
          <div className="flex space-x-2">
            <button 
              onClick={convertToPdf}
              disabled={files.length === 0}
              className="flex-grow bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 
                         disabled:bg-gray-300 disabled:cursor-not-allowed 
                         transition-colors flex items-center justify-center gap-2"
            >
              <FiFile className="w-5 h-5" /> Convert to PDF
            </button>

            {files.length > 0 && (
              <button 
                onClick={() => setFiles([])}
                className="bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {step === 'download' && convertedFile && (
          <div className="flex flex-col space-y-2 items-center">
            <a 
              href={convertedFile}
              download="converted.pdf"
              className="text-green-600 hover:underline flex items-center justify-center gap-2"
            >
              <FiDownload className="w-5 h-5" /> Download PDF
            </a>
            <button 
              onClick={resetConverter}
              className="text-blue-600 hover:underline"
            >
              Convert Another
            </button>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center">
          Supports .jpg, .jpeg, .png, .gif | Max file size: Unlimited
        </p>
      </div>
    </div>
  );
}
