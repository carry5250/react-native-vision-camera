/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import React, {
    useCallback,
    useRef,
    forwardRef,
    useImperativeHandle,
    useEffect,
} from "react";
import {
    View,
    DeviceEventEmitter,StyleSheet
} from "react-native";
import NativeVisionCameraView, { VisionCameraCommands } from "./NativeVisionCameraView";
import type { VisionCameraCommandsType, VisionCameraComponentType } from "./NativeVisionCameraView";

import type { GestureResponderEvent, NativeSyntheticEvent } from "react-native";
import { PhotoFile, TakePhotoOptions } from "./types/PhotoFile";
import { VisionCameraProps } from "./types/Camera";
import NativeVisionCameraModule from "./NativeVisionCameraModule";

export { NativeVisionCameraModule };


// Types
export * from './types/CameraDevice'
export * from './types/Frame'
export * from './types/Orientation'
export * from './types/PhotoFile'
export * from './types/PixelFormat'
export * from './types/Point'
export * from './types/CodeScanner'

// Devices API
export * from './devices/getCameraFormat'
export * from './devices/getCameraDevice'
export * from './devices/Templates'

// Hooks
export * from './hooks/useCameraDevice'
export * from './hooks/useCameraDevices'
export * from './hooks/useCameraFormat'
export * from './hooks/useCameraPermission'
export * from './hooks/useCodeScanner'

import { CameraDevicesChangedCallback, CameraDevicesChangedReturn, CameraPermissionRequestResult, CameraPermissionStatus } from "./NativeVisionCameraModule";
import { CameraDevice } from "./types/CameraDevice";
import { Point } from "./types/Point";
import { RecordVideoOptions, VideoFile } from "./types/VideoFile";
import { Code, CodeScannerFrame } from "./types/CodeScanner";
import { CameraCaptureError } from "./types/CameraError";

type VisionCameraCommands =
    | 'takePhoto'
    | 'focus'
    | 'setIsActive'
    | 'startRecording'
    | 'stopRecording'
    | 'pauseRecording'
    | 'resumeRecording'
    | 'cancelRecording'
    | 'getAvailableCameraDevices'
    | 'addCameraDevicesChangedListener'
    | 'getCameraPermissionStatus'
    | 'requestCameraPermission'
    | 'getMicrophonePermissionStatus'
    | 'requestMicrophonePermission'
    | 'getLocationPermissionStatus'
    | 'requestLocationPermission'

export interface VisionCameraRef extends Omit<VisionCameraCommandsType, VisionCameraCommands> {
    takePhoto: (options?: TakePhotoOptions) => Promise<PhotoFile>;
    focus: (point: Point) => Promise<void>;
    setIsActive: (isActive: boolean) => Promise<void>;
    startRecording: (options: RecordVideoOptions) => void;
    stopRecording: () => void;
    pauseRecording: () => void;
    resumeRecording: () => void;
    cancelRecording: () => void;
    getAvailableCameraDevices: () => CameraDevice[];
    addCameraDevicesChangedListener: (listener: CameraDevicesChangedCallback) => CameraDevicesChangedReturn;
    getCameraPermissionStatus: () => CameraPermissionStatus;
    requestCameraPermission: () => Promise<CameraPermissionRequestResult>;
    getMicrophonePermissionStatus: () => CameraPermissionStatus;
    requestMicrophonePermission: () => Promise<CameraPermissionRequestResult>;
    getLocationPermissionStatus: () => CameraPermissionStatus;
    requestLocationPermission: () => Promise<CameraPermissionRequestResult>;
}

export const Camera = forwardRef<VisionCameraRef, VisionCameraProps>(
    (
        {
            style,
            device,
            isActive,
            preview,
            resizeMode,
            fps,
            videoHdr,
            enableZoomGesture,
            codeScanner,
            format,
            exposure,
            zoom,
            audio,
            video,
            torch,
            photo,
            videoStabilizationMode,
            androidPreviewViewType,
            enableLocation,
            photoQualityBalance,
            onTouchEnd,
            onStarted,
            onStopped,
            onInitialized,
            onShutter,
            onError,
            ...rest
        },
        ref
    ) => {
        const VisionCameraRef = useRef<React.ElementRef<VisionCameraComponentType>>(null);

        const takePhoto = (options?: TakePhotoOptions): Promise<PhotoFile> => {
            return new Promise((resolve) => {
                const onCodeScannedListener = DeviceEventEmitter.addListener('onTaskPhoto', (data: PhotoFile) => {
                    resolve(data);
                    onCodeScannedListener.remove();
                });
                if (!VisionCameraRef.current) throw new Error("VisionCameraRef.current is NaN");
                VisionCameraCommands.takePhoto(VisionCameraRef.current, options);
            })
        };

        const focus = useCallback(
            (point: Point) => {
                if (!point) throw new Error("VisionCameraCommands focus point is Null");
                if (!VisionCameraRef.current) throw new Error("VisionCameraRef.current is NaN");
                return VisionCameraCommands.focus(VisionCameraRef.current, point);
            },
            []
        );

        const setIsActive = useCallback(
            (isActive: boolean) => {
                if (isActive === undefined) throw new Error("VisionCameraCommands isActive is undefined");
                if (!VisionCameraRef.current) throw new Error("VisionCameraRef.current is NaN");
                return VisionCameraCommands.setIsActive(VisionCameraRef.current, isActive);
            },
            [isActive]
        );

        const startRecording = useCallback(
            (options: RecordVideoOptions) => {
                if (!VisionCameraRef.current) throw new Error("VisionCameraRef.current is NaN");
                const onRecordingFinishedListener = DeviceEventEmitter.addListener('onRecordingFinished', (video: VideoFile) => {
                    options.onRecordingFinished(video);
                    onRecordingFinishedListener.remove();
                });
                const onRecordingErrorListener = DeviceEventEmitter.addListener('onRecordingError', (error: CameraCaptureError) => {
                    options.onRecordingError(error);
                    onRecordingErrorListener.remove();
                    onRecordingFinishedListener.remove();
                });
                return VisionCameraCommands.startRecording(VisionCameraRef.current, options);
            },
            []
        );

        const stopRecording = useCallback(
            () => {
                if (!VisionCameraRef.current) throw new Error("VisionCameraRef.current is NaN");
                return VisionCameraCommands.stopRecording(VisionCameraRef.current);
            },
            []
        );

        const pauseRecording = useCallback(
            () => {
                if (!VisionCameraRef.current) throw new Error("VisionCameraRef.current is NaN");
                return VisionCameraCommands.pauseRecording(VisionCameraRef.current);
            },
            []
        );

        const resumeRecording = useCallback(
            () => {
                if (!VisionCameraRef.current) throw new Error("VisionCameraRef.current is NaN");
                return VisionCameraCommands.resumeRecording(VisionCameraRef.current);
            },
            []
        );

        const cancelRecording = useCallback(
            () => {
                if (!VisionCameraRef.current) throw new Error("VisionCameraRef.current is NaN");
                return VisionCameraCommands.cancelRecording(VisionCameraRef.current);
            },
            []
        );

        const getAvailableCameraDevices = useCallback(
            () => {
                return new Promise(resolve => {
                    const eventListener = DeviceEventEmitter.addListener(
                        'getAvailableCameraDevices',
                        (data) => {
                            resolve(data);
                            eventListener.remove();
                        },
                    );
                    if (!VisionCameraRef.current) throw new Error("VisionCameraRef.current is NaN");
                    VisionCameraCommands.getAvailableCameraDevices(VisionCameraRef.current);
                });
            },
            []
        );

        const addCameraDevicesChangedListener = useCallback(
            () => {
                if (!VisionCameraRef.current) throw new Error("VisionCameraRef.current is NaN");
                return VisionCameraCommands.addCameraDevicesChangedListener(VisionCameraRef.current);
            },
            []
        );

        const getCameraPermissionStatus = useCallback(
            () => {
                return new Promise(resolve => {
                    const eventListener = DeviceEventEmitter.addListener(
                        'getCameraPermissionStatus',
                        (data) => {
                            resolve(data);
                            eventListener.remove();
                        },
                    );
                    if (!VisionCameraRef.current) throw new Error("VisionCameraRef.current is NaN");
                    VisionCameraCommands.getCameraPermissionStatus(VisionCameraRef.current);
                });
            },
            []
        );

        const requestCameraPermission = useCallback(
            () => {
                return new Promise(resolve => {
                    const eventListener = DeviceEventEmitter.addListener(
                        'requestCameraPermission',
                        (data) => {
                            resolve(data);
                            eventListener.remove();
                        },
                    );
                    if (!VisionCameraRef.current) throw new Error("VisionCameraRef.current is NaN");
                    VisionCameraCommands.requestCameraPermission(VisionCameraRef.current);
                });
            },
            []
        );

        const getMicrophonePermissionStatus = useCallback(
            () => {
                return new Promise(resolve => {
                    const eventListener = DeviceEventEmitter.addListener(
                        'getMicrophonePermissionStatus',
                        (data) => {
                            resolve(data);
                            eventListener.remove();
                        },
                    );
                    if (!VisionCameraRef.current) throw new Error("VisionCameraRef.current is NaN");
                    VisionCameraCommands.getMicrophonePermissionStatus(VisionCameraRef.current);
                });
            },
            []
        );

        const requestMicrophonePermission = useCallback(
            () => {
                return new Promise(resolve => {
                    const eventListener = DeviceEventEmitter.addListener(
                        'requestMicrophonePermission',
                        (data) => {
                            resolve(data);
                            eventListener.remove();
                        },
                    );
                    if (!VisionCameraRef.current) throw new Error("VisionCameraRef.current is NaN");
                    VisionCameraCommands.requestMicrophonePermission(VisionCameraRef.current);
                });
            },
            []
        );

        const getLocationPermissionStatus = useCallback(
            () => {
                return new Promise(resolve => {
                    const eventListener = DeviceEventEmitter.addListener(
                        'getLocationPermissionStatus',
                        (data) => {
                            resolve(data);
                            eventListener.remove();
                        },
                    );
                    if (!VisionCameraRef.current) throw new Error("VisionCameraRef.current is NaN");
                    VisionCameraCommands.getLocationPermissionStatus(VisionCameraRef.current);
                });
            },
            []
        );

        const requestLocationPermission = useCallback(
            () => {
                return new Promise(resolve => {
                    const eventListener = DeviceEventEmitter.addListener(
                        'requestLocationPermission',
                        (data) => {
                            resolve(data);
                            eventListener.remove();
                        },
                    );
                    if (!VisionCameraRef.current) throw new Error("VisionCameraRef.current is NaN");
                    VisionCameraCommands.requestLocationPermission(VisionCameraRef.current);
                });
            },
            []
        );

        const onVisionCameraStarted = useCallback(
            () => {
                onStarted?.();
            },
            [onStarted]
        );

        const onVisionCameraTouchEnd = useCallback(
            (event: GestureResponderEvent) => {
                onTouchEnd?.(event);
            },
            [onTouchEnd]
        );

        const onVisionCameraStopped = useCallback(
            () => {
                onStopped?.();
            },
            [onStopped]
        );

        const onVisionCameraInitialized = useCallback(
            () => {
                onInitialized?.();
            },
            [onInitialized]
        );

        const onVisionCameraShutter = useCallback(
            (shutterEvent: NativeSyntheticEvent<{ type: 'photo' | 'snapshot' }>) => {
                onShutter?.(shutterEvent.nativeEvent);
            },
            [onShutter]
        );

        const onVisionCameraError = useCallback(
            (error: NativeSyntheticEvent<{ error: string }>) => {
                onError?.(error.nativeEvent);
            },
            [onError]
        );

        const onVisionCameraCodeScanned = useCallback(
            (codes: Code[], frame: CodeScannerFrame) => {
                if (codeScanner?.onCodeScanned) {
                    codeScanner.onCodeScanned?.(codes, frame);
                }
            },
            [codeScanner]
        );

        useEffect(() => {
            const onInitializedListener = DeviceEventEmitter.addListener('onInitialized', () => {
                onInitialized?.();
            });
            const onShutterListener = DeviceEventEmitter.addListener('onShutter', (shutterEvent: { type: 'photo' | 'snapshot' }) => {
                onShutter?.(shutterEvent);
            });
            const onStartedListener = DeviceEventEmitter.addListener('onCameraStarted', () => {
                onStarted?.();
            });
            const onStoppedListener = DeviceEventEmitter.addListener('onCameraStopped', () => {
                onStopped?.();
            });
            const onErrorListener = DeviceEventEmitter.addListener('onError', (err) => {
                onError?.(err);
            });
            const onCodeScannedListener = DeviceEventEmitter.addListener('onCodeScanned', (data: { codes: Code[], frame: CodeScannerFrame }) => {
                codeScanner?.onCodeScanned?.(data.codes, data.frame);
            });
            return () => {
                onInitializedListener.remove();
                onShutterListener.remove();
                onStartedListener.remove();
                onStoppedListener.remove();
                onErrorListener.remove();
                onCodeScannedListener.remove();
            }

        })

        useImperativeHandle(
            ref,
            () => ({
                focus,
                setIsActive,
                takePhoto,
                startRecording,
                stopRecording,
                pauseRecording,
                resumeRecording,
                cancelRecording,
                getAvailableCameraDevices,
                addCameraDevicesChangedListener,
                getCameraPermissionStatus,
                requestCameraPermission,
                getMicrophonePermissionStatus,
                requestMicrophonePermission,
                getLocationPermissionStatus,
                requestLocationPermission,
            }),
            [
                focus,
                setIsActive,
                takePhoto,
                startRecording,
                stopRecording,
                pauseRecording,
                resumeRecording,
                cancelRecording,
                getAvailableCameraDevices,
                addCameraDevicesChangedListener,
                getCameraPermissionStatus,
                requestCameraPermission,
                getMicrophonePermissionStatus,
                requestMicrophonePermission,
                getLocationPermissionStatus,
                requestLocationPermission,
            ]
        );

        return (
            <View onTouchEnd={onVisionCameraTouchEnd} style={style} >
                <NativeVisionCameraView
                    onCodeScanned={onVisionCameraCodeScanned}
                    ref={VisionCameraRef}
                    style={StyleSheet.absoluteFill}
                    codeScanner={codeScanner}
                    fps={fps}
                    videoHdr={videoHdr}
                    isActive={isActive}
                    preview={preview === undefined ? true : preview}
                    device={device}
                    resizeMode={resizeMode || 'cover'}
                    enableZoomGesture={enableZoomGesture}
                    exposure={exposure}
                    zoom={zoom}
                    audio={audio}
                    video={video}
                    torch={torch}
                    photo={photo}
                    videoStabilizationMode={videoStabilizationMode}
                    androidPreviewViewType={androidPreviewViewType}
                    enableLocation={enableLocation}
                    photoQualityBalance={photoQualityBalance}
                    onStarted={onVisionCameraStarted}
                    onStopped={onVisionCameraStopped}
                    onInitialized={onVisionCameraInitialized}
                    onShutter={onVisionCameraShutter}
                    onError={onVisionCameraError}
                    {...rest}
                />
            </View>
        );
    }
);

export interface Camera extends VisionCameraRef { };

Camera.getAvailableCameraDevices = NativeVisionCameraModule.getAvailableCameraDevices;
Camera.getCameraPermissionStatus = NativeVisionCameraModule.getCameraPermissionStatus;
Camera.requestCameraPermission = NativeVisionCameraModule.requestCameraPermission;
Camera.getMicrophonePermissionStatus = NativeVisionCameraModule.getMicrophonePermissionStatus;
Camera.requestMicrophonePermission = NativeVisionCameraModule.requestMicrophonePermission;
Camera.getLocationPermissionStatus = NativeVisionCameraModule.getLocationPermissionStatus;
Camera.requestLocationPermission = NativeVisionCameraModule.requestLocationPermission;

export default Camera;