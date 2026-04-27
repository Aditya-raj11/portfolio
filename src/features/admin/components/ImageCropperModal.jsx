import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../../utils/cropImage';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageCropperModal = ({ isOpen, imageSrc, onClose, onCropComplete }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropping, setIsCropping] = useState(false);

    const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels || !imageSrc) return;
        setIsCropping(true);
        try {
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            
            // Create a File from the Blob
            const file = new File([croppedImageBlob], "profile_picture.jpg", { type: "image/jpeg" });
            
            onCropComplete(file);
        } catch (e) {
            console.error(e);
            alert("Error cropping image");
        } finally {
            setIsCropping(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
                    >
                        <div className="p-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Adjust Profile Picture</h3>
                            <button onClick={onClose} className="p-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors bg-black/5 dark:bg-white/5 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="relative w-full h-[400px] bg-black">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onCropComplete={onCropCompleteHandler}
                                onZoomChange={setZoom}
                            />
                        </div>

                        <div className="p-6 bg-white dark:bg-[#1a1a1a] flex flex-col gap-6">
                            <div className="flex items-center gap-4">
                                <ZoomOut size={20} className="text-gray-500" />
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(e.target.value)}
                                    className="w-full accent-black dark:accent-white h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <ZoomIn size={20} className="text-gray-500" />
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-white/5 text-black dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={isCropping}
                                    className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                                >
                                    {isCropping ? "Cropping..." : <><Check size={18} /> Apply</>}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ImageCropperModal;
