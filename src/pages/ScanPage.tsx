import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, FlashlightOff, Flashlight, RotateCcw, 
  QrCode, ShoppingCart, Star, MapPin, Clock,
  ArrowLeft, Search, Gift, Zap
} from "lucide-react";
import { Link } from "react-router-dom";

const ScanPage = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [scannedDeals, setScannedDeals] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkCameraAccess();
    return () => {
      stopCamera();
    };
  }, []);

  const checkCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCamera(true);
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Camera access error:', error);
      setHasCamera(false);
    }
  };

  const handleScan = (data: string | null) => {
    if (data) {
      console.log('Scanned Code:', data);
      toast({
        title: "QR Code Scanned",
        description: `Code: ${data}`,
      });
      setScannedDeals(prev => [...prev, { code: data, time: new Date() }]);
    }
  };

  const handleError = (error: any) => {
    console.error('QR Code Scan Error:', error);
    toast({
      title: "Scan Error",
      description: "Failed to scan QR code. Please try again.",
      variant: "destructive"
    });
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualCodeSubmit = () => {
    if (manualCode) {
      console.log('Manual Code Submitted:', manualCode);
      toast({
        title: "Code Submitted",
        description: `Code: ${manualCode}`,
      });
      setScannedDeals(prev => [...prev, { code: manualCode, time: new Date() }]);
    } else {
      toast({
        title: "Error",
        description: "Please enter a code",
        variant: "destructive"
      });
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsScanning(true);
      setHasCamera(true);
    } catch (error) {
      console.error('Camera access error:', error);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to scan QR codes",
        variant: "destructive"
      });
    }
  };

  const toggleFlash = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && track.getCapabilities) {
        const capabilities = track.getCapabilities();
        if (capabilities && 'torch' in capabilities) {
          try {
            await track.applyConstraints({
              advanced: [{ torch: !flashOn } as any]
            });
            setFlashOn(!flashOn);
          } catch (error) {
            console.error('Flash toggle error:', error);
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Scan & Redeem</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  QR Code Scanner
                </CardTitle>
                <CardDescription>
                  Point your camera at a QR code to scan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!hasCamera ? (
                  <div className="text-center p-6">
                    <div className="text-4xl text-gray-500 mb-4">
                      <Camera />
                    </div>
                    <p className="text-gray-600">Camera access is required to scan QR codes.</p>
                  </div>
                ) : isScanning ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full aspect-video rounded-lg"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button variant="secondary" size="icon" onClick={toggleFlash}>
                        {flashOn ? <FlashlightOff className="w-4 h-4" /> : <Flashlight className="w-4 h-4" />}
                      </Button>
                      <Button variant="secondary" size="icon" onClick={stopCamera}>
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <div className="text-4xl text-gray-500 mb-4">
                      <Camera />
                    </div>
                    <p className="text-gray-600">Tap below to start scanning</p>
                    <Button onClick={startCamera}>
                      Start Scanning
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Manual Code Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Enter code manually"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleManualCodeSubmit}>
                    Submit
                  </Button>
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Scanned Deals Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Scanned Deals
                </CardTitle>
                <CardDescription>
                  List of recently scanned deals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {scannedDeals.length === 0 ? (
                  <div className="text-center p-6">
                    <div className="text-4xl text-gray-500 mb-4">
                      <Gift />
                    </div>
                    <p className="text-gray-600">No deals scanned yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scannedDeals.map((deal, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{deal.code}</h3>
                          <p className="text-sm text-gray-500">
                            Scanned at {deal.time.toLocaleTimeString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Redeem
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanPage;
