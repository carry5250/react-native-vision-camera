/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import type { CameraCaptureError } from './CameraError'
import type { TemporaryFile } from './TemporaryFile'

export interface RecordVideoOptions {
  flash?: 'on' | 'off'
  fileType?: 'mov' | 'mp4'
  onRecordingError: (error: CameraCaptureError) => void
  onRecordingFinished: (video: VideoFile) => void
  videoCodec?: 'h264' | 'h265'
  videoBitRate?: 'extra-low' | 'low' | 'normal' | 'high' | 'extra-high' | number
}

export interface VideoFile extends TemporaryFile {
  duration: number
  width: number
  height: number
}
