
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, QrCode, Upload, ArrowLeft, CheckCircle,
  AlertCircle, Flashlight, RotateCcw, X
} from "lucide-react";
import { Link } from "react-router-dom";

const ScanPage = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraPermissionGranted, setIsCameraPermissionGranted] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setIsCameraPermissionGranted(true);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Camera permission denied:', err);
      setError('Camera permission is required to scan QR codes');
      setIsCameraPermissionGranted(false);
      return false;
    }
  };

  const startScanning = async () => {
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
      setIsScanning(true);
      setScanResult(null);
      setError(null);
      
      // Start QR code detection (simplified simulation)
      simulateQRDetection();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setIsCameraPermissionGranted(false);
  };

  const simulateQRDetection = () => {
    // Simulate QR code detection after 3 seconds
    setTimeout(() => {
      const mockQRCodes = [
        'DEAL_REDEEM_ABC123',
        'MERCHANT_CHECK_IN_XYZ789',
        'LOYALTY_POINTS_DEF456',
        'INVALID_QR_CODE'
      ];
      
      const randomCode = mockQRCodes[Math.floor(Math.random() * mockQRCodes.length)];
      handleQRCodeDetected(randomCode);
    }, 3000);
  };

  const handleQRCodeDetected = (qrData: string) => {
    setScanResult(qrData);
    setIsScanning(false);
    
    // Process different types of QR codes
    if (qrData.startsWith('DEAL_REDEEM_')) {
      const dealCode = qrData.replace('DEAL_REDEEM_', '');
      toast({
        title: "Deal Code Scanned!",
        description: `Processing redemption for code: ${dealCode}`
      });
      
      // In real implementation, this would call API to redeem the deal
      setTimeout(() => {
        toast({
          title: "Success!",
          description: "Your deal has been redeemed successfully"
        });
      }, 2000);
      
    } else if (qrData.startsWith('MERCHANT_CHECK_IN_')) {
      const merchantId = qrData.replace('MERCHANT_CHECK_IN_', '');
      toast({
        title: "Checked In!",
        description: "You've successfully checked in to the merchant"
      });
      
    } else if (qrData.startsWith('LOYALTY_POINTS_')) {
      const pointsCode = qrData.replace('LOYALTY_POINTS_', '');
      toast({
        title: "Points Earned!",
        description: "You've earned 50 JaiCoins for this visit"
      });
      
    } else {
      setError('Invalid QR code. Please scan a valid MyJaipur QR code.');
    }
  };

  const toggleFlash = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && 'torch' in track.getCapabilities()) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !isFlashOn }]
          });
          setIsFlashOn(!isFlashOn);
        } catch (err) {
          console.error('Flash not supported:', err);
          toast({
            title: "Flash not supported",
            description: "Your device doesn't support camera flash",
            variant: "destructive"
          });
        }
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In real implementation, this would use a QR code reading library
      toast({
        title: "Processing Image",
        description: "Scanning uploaded image for QR codes..."
      });
      
      // Simulate QR detection from image
      setTimeout(() => {
        handleQRCodeDetected('DEAL_REDEEM_UPLOAD123');
      }, 2000);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
    stopCamera();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">QR Code Scanner</h1>
              <p className="text-gray-600">Scan QR codes to redeem deals and earn points</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Scanner Interface */}
          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <QrCode className="w-6 h-6" />
                QR Code Scanner
              </CardTitle>
              <CardDescription>
                Position the QR code within the scanner frame
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Camera View */}
                <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden relative">
                  {isScanning ? (
                    <div className="relative w-full h-full">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Scanning Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 border-2 border-white rounded-lg relative">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-pink-500 rounded-tl-lg"></div>
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-pink-500 rounded-tr-lg"></div>
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-pink-500 rounded-bl-lg"></div>
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-pink-500 rounded-br-lg"></div>
                          
                          {/* Scanning Line Animation */}
                          <div className="absolute inset-0 overflow-hidden">
                            <div className="w-full h-0.5 bg-pink-500 shadow-lg animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Flash Button */}
                      <div className="absolute top-4 right-4">
                        <Button
                          onClick={toggleFlash}
                          size="sm"
                          variant="outline"
                          className={`bg-black/50 border-white text-white ${isFlashOn ? 'bg-yellow-500/80' : ''}`}
                        >
                          <Flashlight className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Stop Button */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <Button
                          onClick={stopCamera}
                          size="sm"
                          variant="outline"
                          className="bg-black/50 border-white text-white"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Stop
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-white">
                      <div className="text-center">
                        <QrCode className="w-24 h-24 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">Ready to Scan</p>
                        <p className="text-sm opacity-75">Tap the camera button to start scanning</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Controls */}
                <div className="flex justify-center gap-4 mt-6">
                  {!isScanning ? (
                    <>
                      <Button
                        onClick={startScanning}
                        size="lg"
                        className="bg-gradient-to-r from-pink-500 to-orange-400"
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Start Scanning
                      </Button>
                      
                      <Button variant="outline" size="lg" asChild>
                        <label className="cursor-pointer">
                          <Upload className="w-5 h-5 mr-2" />
                          Upload Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </Button>
                    </>
                  ) : (
                    <Button onClick={resetScanner} variant="outline" size="lg">
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Reset Scanner
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scan Result */}
          {scanResult && (
            <Card className="mb-8 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-green-800 mb-2">QR Code Scanned Successfully!</h3>
                    <p className="text-green-700 text-sm mb-3">Detected Code: {scanResult}</p>
                    <Button size="sm" onClick={resetScanner}>
                      Scan Another Code
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-2">Scanner Error</h3>
                    <p className="text-red-700 text-sm mb-3">{error}</p>
                    <Button size="sm" onClick={resetScanner}>
                      Try Again
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* How to Use */}
          <Card>
            <CardHeader>
              <CardTitle>How to Use QR Scanner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Redeem Deals</h4>
                    <p className="text-sm text-gray-600">Scan QR codes at merchant locations to redeem your purchased deals</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Check-in at Merchants</h4>
                    <p className="text-sm text-gray-600">Scan merchant check-in codes to earn bonus JaiCoins</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Loyalty Points</h4>
                    <p className="text-sm text-gray-600">Scan special QR codes to collect loyalty points and rewards</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-semibold">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Share & Earn</h4>
                    <p className="text-sm text-gray-600">Scan referral QR codes from friends to earn bonus rewards</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Tips for Better Scanning:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ensure good lighting for optimal scanning</li>
                  <li>• Hold your device steady and within 6-12 inches of the QR code</li>
                  <li>• Make sure the entire QR code is visible within the scanner frame</li>
                  <li>• Clean your camera lens for better image quality</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ScanPage;
