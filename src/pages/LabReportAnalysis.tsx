import React, { useState, useRef, useEffect } from 'react';
import { FileUp, Upload, AlertCircle, Trash2, WifiOff, LogIn } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { 
  uploadLabReport, 
  analyzeLabReport, 
  saveLabReport, 
  getUserLabReports,
  deleteLabReport,
  testFirebaseStorage,
  isUserAuthenticated,
  debugAuthStatus
} from '../lib/lab-report-service';
import { trackUserActivity, Feature, Action } from '../lib/user-activity-service';
import type { LabReport, LabReportAnalysisResult } from '../lib/lab-report-service';

interface AnalysisResult extends LabReportAnalysisResult {
  reportId?: string;
}

const LabReportAnalysis: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savedReports, setSavedReports] = useState<LabReport[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isDeleting, setIsDeleting] = useState<{[key: string]: boolean}>({});
  const [storageStatus, setStorageStatus] = useState<{checked: boolean, connected: boolean, message: string}>({
    checked: false,
    connected: false,
    message: 'Checking Firebase Storage connectivity...'
  });
  const [authChecked, setAuthChecked] = useState(false);
  const [authDebugInfo, setAuthDebugInfo] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Test Firebase Storage connectivity on component mount
  useEffect(() => {
    const checkStorageConnectivity = async () => {
      try {
        const result = await testFirebaseStorage();
        setStorageStatus({
          checked: true,
          connected: result.success,
          message: result.message
        });
      } catch (err) {
        console.error('Error testing storage connectivity:', err);
        setStorageStatus({
          checked: true,
          connected: false,
          message: `Failed to connect to Firebase Storage: ${err instanceof Error ? err.message : 'Unknown error'}`
        });
      }
    };
    
    checkStorageConnectivity();
  }, []);

  // Check authentication status when auth loading completes
  useEffect(() => {
    if (!loading) {
      const isAuthed = isUserAuthenticated();
      setAuthChecked(true);
      
      // Get debug info
      const checkAuthDebug = async () => {
        const debugInfo = await debugAuthStatus();
        setAuthDebugInfo(debugInfo);
        
        console.log('Authentication status checked:', { 
          isAuthenticated, 
          isAuthed,
          debugInfo
        });
      };
      
      checkAuthDebug();
    }
  }, [loading, isAuthenticated]);

  // Fetch user's saved reports when authenticated
  useEffect(() => {
    if (isAuthenticated && user && storageStatus.connected && authChecked) {
      fetchUserReports();
      
      // Track activity when user views Lab Report Analysis
      trackUserActivity(user.id, Feature.LAB_REPORT_ANALYSIS, Action.VIEW);
    }
  }, [isAuthenticated, user, storageStatus.connected, authChecked]);

  // Refresh auth debug info periodically
  useEffect(() => {
    // Initial check
    if (isAuthenticated) {
      const initialCheck = async () => {
        const debugInfo = await debugAuthStatus();
        setAuthDebugInfo(debugInfo);
        
        // If token is expired, show warning
        if (debugInfo.tokenExpired) {
          console.warn('Authentication token is expired');
          setError('Your authentication session has expired. Please sign in again to save reports.');
        }
      };
      
      initialCheck();
    }
    
    // Set up periodic check
    const interval = setInterval(() => {
      if (isAuthenticated) {
        const periodicCheck = async () => {
          const debugInfo = await debugAuthStatus();
          setAuthDebugInfo(debugInfo);
          
          // If authentication status changed, update UI
          if (!debugInfo.isAuthenticated || debugInfo.tokenExpired) {
            console.warn('Authentication status changed: token expired or user logged out');
            setError('Your authentication session has expired. Please sign in again to save reports.');
          }
        };
        
        periodicCheck();
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Fetch user's lab reports from Firestore
  const fetchUserReports = async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    try {
      const reports = await getUserLabReports(user.id);
      setSavedReports(reports);
    } catch (err) {
      console.error('Error fetching lab reports:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

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

  const handleDeleteReport = async (report: LabReport) => {
    if (!report.id) return;
    
    // Set deleting state for this report
    setIsDeleting(prev => ({ ...prev, [report.id!]: true }));
    
    try {
      await deleteLabReport(report);
      // Remove from local state
      setSavedReports(prev => prev.filter(r => r.id !== report.id));
    } catch (err) {
      console.error('Error deleting report:', err);
      setError('Failed to delete report. Please try again.');
    } finally {
      // Clear deleting state
      setIsDeleting(prev => ({ ...prev, [report.id!]: false }));
    }
  };

  const refreshAuthStatus = async () => {
    const debugInfo = await debugAuthStatus();
    setAuthDebugInfo(debugInfo);
    console.log('Authentication status refreshed:', debugInfo);
  };

  const handleAnalyzeClick = async () => {
    if (files.length === 0) {
      setError('Please upload at least one file to analyze.');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Check authentication status before proceeding
      await refreshAuthStatus();
      
      // If user appears authenticated in state but not in Firebase,
      // show a warning but continue with analysis
      if (isAuthenticated && !isUserAuthenticated()) {
        console.warn('User appears authenticated in React state but not in Firebase');
        setError('Authentication issue detected. You can analyze files, but saving may fail.');
      }
      
      const analysisResults: AnalysisResult[] = [];
      
      for (const file of files) {
        try {
          // Analyze the file using Gemini API and pass the actual file content
          const result = await analyzeLabReport(file.name, file.type, file);
          
          // Skip file upload and saving functionality
          // The analysis results will still be displayed but not saved
          
          analysisResults.push(result);
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          // Add an error result for this file but continue with others
          analysisResults.push({
            title: `Analysis for ${file.name}`,
            reportType: "Error",
            explanation: `Failed to analyze this file: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`,
            recommendations: ["Please try again or contact support."],
            abnormalFindings: [],
            keyValues: {}
          });
        }
      }
      
      setResults(analysisResults);
      
      // If we have results but there was an error, show a warning
      if (analysisResults.length > 0 && analysisResults.some(r => r.reportType === "Error" || r.reportType === "Analysis Failed")) {
        setError('Some files could not be analyzed properly. See the results for details.');
      }
    } catch (err) {
      setError('An error occurred during analysis. Please try again later.');
      console.error('General error during analysis:', err);
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
        
        {/* Information notice about not saving files */}
        <div className="bg-blue-500/20 border border-blue-500 text-blue-100 p-4 rounded-md mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <div>
            <p className="font-medium">Analysis Only Mode</p>
            <p className="text-sm">Files are only analyzed locally and not saved to any database or cloud storage.</p>
          </div>
        </div>
        
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
          <p className="mt-2 text-gray-400 text-sm">
            Note: Files are only analyzed locally and not saved to any server.
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
                  
                  {result.reportType && result.reportType !== "Unknown report type" && (
                    <div className="mb-4">
                      <h4 className="text-lg font-medium mb-2">Report Type</h4>
                      <p className="text-gray-300">{result.reportType}</p>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h4 className="text-lg font-medium mb-2">Explanation</h4>
                    <p className="text-gray-300 whitespace-pre-wrap">{
                      // If explanation starts with quotes or contains JSON-like text, clean it up
                      result.explanation.startsWith('"') && result.explanation.endsWith('"')
                        ? result.explanation.slice(1, -1)
                        : result.explanation
                    }</p>
                  </div>
                  
                  {result.abnormalFindings && result.abnormalFindings.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-lg font-medium mb-2">Abnormal Findings</h4>
                      <ul className="list-disc list-inside text-gray-300">
                        {result.abnormalFindings.map((finding, idx) => (
                          <li key={idx} className="mb-1">
                            {typeof finding === 'string' 
                              ? finding.startsWith('"') && finding.endsWith('"')
                                ? finding.slice(1, -1)
                                : finding
                              : 'Invalid finding format'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.keyValues && Object.keys(result.keyValues).length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-lg font-medium mb-2">Key Values</h4>
                      <div className="bg-gray-700 rounded-md p-3">
                        {Object.entries(result.keyValues).map(([key, value], idx) => (
                          <div key={idx} className="flex justify-between border-b border-gray-600 py-2 last:border-0">
                            <span className="font-medium">{key}</span>
                            <span>{typeof value === 'string' 
                              ? value.startsWith('"') && value.endsWith('"')
                                ? value.slice(1, -1)
                                : value
                              : String(value)
                            }</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-lg font-medium mb-2">Recommendations</h4>
                    <ul className="list-disc list-inside text-gray-300">
                      {result.recommendations.map((rec, recIndex) => (
                        <li key={recIndex} className="mb-1">
                          {typeof rec === 'string' 
                            ? rec.startsWith('"') && rec.endsWith('"')
                              ? rec.slice(1, -1)
                              : rec
                            : 'Invalid recommendation format'}
                        </li>
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