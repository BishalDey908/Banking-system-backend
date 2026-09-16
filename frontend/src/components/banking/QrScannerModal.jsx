import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Upload,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import jsQR from 'jsqr';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { parseUpiUri } from '../../utils/upi';
import {
  setQrScannerModalOpen,
  setQrScannedData,
  setTransferModalOpen,
} from '../../store/slices/uiSlice';
import { useToast } from '../../hooks/useToast';

/**
 * Interactive QR Code Scanner Modal for UPI Payments
 */
export function QrScannerModal({ isOpen, onClose, onScanSuccess }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useToast();
  const reduxIsOpen = useSelector((state) => state.ui.isQrScannerModalOpen);

  const modalOpen = isOpen !== undefined ? isOpen : reduxIsOpen;

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedData, setLocalScannedData] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameId = useRef(null);
  const fileInputRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const handleClose = useCallback(() => {
    stopCamera();
    setLocalScannedData(null);
    setCameraError(null);
    if (onClose) {
      onClose();
    } else {
      dispatch(setQrScannerModalOpen(false));
    }
  }, [stopCamera, onClose, dispatch]);

  const handleScanHit = useCallback(
    (rawPayload) => {
      if (isProcessing) return;
      setIsProcessing(true);
      stopCamera();

      const parsed = parseUpiUri(rawPayload);
      if (!parsed.isValid && !parsed.upiId) {
        showError('Unrecognized QR code format. Please scan a valid UPI QR.');
        setIsProcessing(false);
        return;
      }

      setLocalScannedData(parsed);
      dispatch(setQrScannedData(parsed));

      if (onScanSuccess) {
        onScanSuccess(parsed);
      }

      showSuccess(`Scanned UPI payee: ${parsed.upiId}`);
      setIsProcessing(false);
    },
    [isProcessing, stopCamera, dispatch, onScanSuccess, showError, showSuccess]
  );

  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by this browser.');
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.warn('Camera stream error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. You can upload a QR image or select a test preset below.');
      } else {
        setCameraError('Unable to open camera stream. Try uploading a QR image instead.');
      }
    }
  }, [facingMode, stopCamera]);

  // Video scanning tick
  useEffect(() => {
    if (!cameraActive || !modalOpen || scannedData) return;

    let isScanning = true;

    const tick = () => {
      if (!isScanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleScanHit(code.data);
          return;
        }
      }

      animationFrameId.current = requestAnimationFrame(tick);
    };

    animationFrameId.current = requestAnimationFrame(tick);

    return () => {
      isScanning = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [cameraActive, modalOpen, scannedData, handleScanHit]);

  // Initialize camera when modal opens
  useEffect(() => {
    if (modalOpen && !scannedData) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [modalOpen, scannedData, startCamera, stopCamera]);

  // File Upload scan
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          handleScanHit(code.data);
        } else {
          showError('No QR code could be detected in the uploaded image.');
        }
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Switch between front/rear camera
  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Proceed with payment to scanned payee
  const handleProceedPayment = () => {
    handleClose();
    // Navigate to /transfers or open transfer modal
    dispatch(setTransferModalOpen(true));
  };

  // Test Presets so anyone can test without a real QR
  const samplePresets = [
    {
      label: 'Aura Member (@aurabank)',
      uri: 'upi://pay?pa=member@aurabank&pn=Aura%20Bank%20Member&am=350.00&cu=INR&tn=Aura%20Member%20Transfer',
    },
    {
      label: 'Rahul Sharma',
      uri: 'upi://pay?pa=rahul.sharma@okhdfcbank&pn=Rahul%20Sharma&am=500.00&cu=INR&tn=Dinner%20Share',
    },
    {
      label: 'Aura Coffee',
      uri: 'upi://pay?pa=auracoffee@paytm&pn=Aura%20Specialty%20Coffee&am=240.00&cu=INR&tn=Cappuccino',
    },
    {
      label: 'Tech Gadgets',
      uri: 'upi://pay?pa=techgadgets@ybl&pn=Tech%20Gadgets%20Store&am=1899.00&cu=INR&tn=Accessories',
    },
  ];

  return (
    <Modal
      isOpen={modalOpen}
      onClose={handleClose}
      title="Scan & Pay"
      description="Scan any UPI QR code using your camera or upload an image."
      size="md"
    >
      <div className="space-y-4">
        {/* Hidden Canvas used for video frame reading */}
        <canvas ref={canvasRef} className="hidden" />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Viewfinder or Scanned Result View */}
        {scannedData ? (
          <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider font-mono text-emerald-700 dark:text-emerald-300 font-semibold">
                QR Code Verified
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                {scannedData.name || 'UPI Payee'}
              </h3>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-0.5">
                {scannedData.upiId}
              </p>
            </div>

            {scannedData.amount && Number(scannedData.amount) > 0 && (
              <div className="inline-block px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-sm font-mono font-bold text-emerald-700 dark:text-emerald-300">
                Amount: ₹{Number(scannedData.amount).toFixed(2)}
              </div>
            )}

            {scannedData.note && (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                "{scannedData.note}"
              </p>
            )}

            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLocalScannedData(null);
                  startCamera();
                }}
              >
                Scan Another
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleProceedPayment}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Pay
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative aspect-square max-w-[340px] mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex flex-col items-center justify-center">
            {/* Live Video Feed */}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              playsInline
            />

            {/* Target Reticle Overlay */}
            <div className="relative z-10 w-48 h-48 border-2 border-emerald-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              {/* Corner brackets */}
              <div className="flex justify-between">
                <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400 rounded-tl" />
                <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400 rounded-tr" />
              </div>

              {/* Animated Laser Scanning Beam */}
              {cameraActive && (
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse shadow-[0_0_8px_#34d399] my-auto" />
              )}

              <div className="flex justify-between">
                <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400 rounded-bl" />
                <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400 rounded-br" />
              </div>
            </div>

            {/* Camera Controls Overlay */}
            {cameraActive && (
              <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs p-1 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="p-1.5 text-white/80 hover:text-white rounded hover:bg-white/10 transition-colors"
                  title="Switch Camera"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Fallback info when camera is inactive or errored */}
            {cameraError && (
              <div className="relative z-20 p-4 mx-4 bg-slate-900/90 backdrop-blur-md rounded-xl border border-rose-800/60 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
                <p className="text-xs text-rose-200">{cameraError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<Upload className="w-3.5 h-3.5" />}
                >
                  Upload QR Image
                </Button>
              </div>
            )}

            {!cameraActive && !cameraError && (
              <div className="relative z-20 text-center space-y-2 text-slate-400 text-xs">
                <Camera className="w-8 h-8 mx-auto text-slate-500 animate-pulse" />
                <p>Initializing camera...</p>
              </div>
            )}
          </div>
        )}

        {/* Upload & Preset Options */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              leftIcon={<Upload className="w-3.5 h-3.5" />}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload QR Image
            </Button>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => {
                handleClose();
                navigate('/transfers');
              }}
            >
              Enter UPI ID Manually
            </Button>
          </div>

          {/* Test Presets for Instant Scanning Validation */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-mono text-slate-400 dark:text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Or test with sample UPI QR presets:</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {samplePresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleScanHit(preset.uri)}
                  className="px-2.5 py-1 text-xs font-mono rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default QrScannerModal;

