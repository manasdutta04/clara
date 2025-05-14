import React, { useState, useRef } from 'react';
import { FileUp, Upload } from 'lucide-react';

interface AnalysisResult {
  title: string;
  explanation: string;
  recommendations: string[];
}

const LabReportAnalysis: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      handleFiles(newFiles);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      handleFiles(newFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    // Filter for acceptable file types (PDF, images, etc.)
    const acceptableFileTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];
    const filteredFiles = newFiles.filter(file => acceptableFileTypes.includes(file.type));
    
    if (filteredFiles.length !== newFiles.length) {
      setError('Some files were rejected. We accept PDF, JPEG, PNG and TIFF files only.');
    } else {
      setError(null);
    }
    
    setFiles(prev => [...prev, ...filteredFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyzeClick = async () => {
    if (files.length === 0) {
      setError('Please upload at least one file to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      // This would be replaced with your actual API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      // Mock results - in a real app, these would come from your API
      const mockResults: AnalysisResult[] = files.map(file => ({
        title: `Analysis for ${file.name}`,
        explanation: "Your cholesterol levels are within normal range. HDL (good cholesterol) is slightly above average, which is positive for heart health.",
        recommendations: [
          "Continue with current diet rich in omega-3 fatty acids",
          "Maintain regular exercise regimen",
          "Schedule follow-up test in 6 months"
        ]
      }));
      
      setResults(mockResults);
    } catch (err) {
      setError('An error occurred during analysis. Please try again later.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    setFiles([]);
    setResults([]);
    setError(null);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-black text-white min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Lab Report Analysis</h1>
        <p className="text-gray-400 mb-8">
          Upload your medical reports and scans to receive AI-powered explanations in simple language you can understand.
        </p>
        
        {/* Upload area */}
        <div 
          className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-blue-400'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileInputChange} 
            multiple 
            className="hidden" 
            accept=".pdf,.jpg,.jpeg,.png,.tiff"
          />
          
          <FileUp className="h-16 w-16 mx-auto mb-4 text-blue-500" />
          <h3 className="text-xl font-semibold mb-2">Drag and drop your files here</h3>
          <p className="text-gray-400 mb-4">or</p>
          <button 
            onClick={triggerFileInput}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition-colors"
          >
            Browse Files
          </button>
          <p className="mt-4 text-gray-400 text-sm">
            Supported formats: PDF, JPEG, PNG, TIFF
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* File list */}
        {files.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Uploaded Files ({files.length})</h2>
              <button 
                onClick={clearAll}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Clear All
              </button>
            </div>
            
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-800 p-3 rounded-md">
                  <div className="flex items-center">
                    <Upload className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <p className="font-medium truncate max-w-md">{file.name}</p>
                      <p className="text-gray-400 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              onClick={handleAnalyzeClick}
              disabled={isAnalyzing}
              className={`mt-4 py-2 px-6 rounded-md transition-colors w-full ${
                isAnalyzing 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Reports'}
            </button>
          </div>
        )}
        
        {/* Results */}
        {results.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-6">Analysis Results</h2>
            
            <div className="space-y-6">
              {results.map((result, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3 text-blue-400">{result.title}</h3>
                  
                  <div className="mb-4">
                    <h4 className="text-lg font-medium mb-2">Explanation</h4>
                    <p className="text-gray-300">{result.explanation}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium mb-2">Recommendations</h4>
                    <ul className="list-disc list-inside text-gray-300">
                      {result.recommendations.map((rec, recIndex) => (
                        <li key={recIndex} className="mb-1">{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400 mb-4">
                Remember: These AI-powered insights are not a replacement for professional medical advice.
                Always consult with your healthcare provider regarding your test results.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabReportAnalysis;