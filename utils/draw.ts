import {
  FaceLandmarker,
  NormalizedLandmark,
  DrawingUtils,
} from '@mediapipe/tasks-vision'

export function drawFacemarks(
  facemarksArray: NormalizedLandmark[][],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  videoWidth: number,
  videoHeight: number
) {
  const radio = videoHeight / videoWidth
  video.style.width = videoWidth + 'px'
  video.style.height = videoWidth * radio + 'px'
  canvas.style.width = videoWidth + 'px'
  canvas.style.height = videoWidth * radio + 'px'
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  const drawingUtils = new DrawingUtils(ctx)
  for (const landmarks of facemarksArray) {
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_TESSELATION,
      { color: '#C0C0C070', lineWidth: 1 }
    )
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
      { color: '#FF3030' }
    )
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
      { color: '#FF3030' }
    )
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
      { color: '#30FF30' }
    )
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
      { color: '#30FF30' }
    )
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
      { color: '#E0E0E0' }
    )
    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
      color: '#E0E0E0',
    })
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
      { color: '#FF3030' }
    )
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
      { color: '#30FF30' }
    )
  }
}

// 只画出判断用到的坐标点
export function drawPoints(
  facemarksArray: NormalizedLandmark[][],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  videoWidth: number,
  videoHeight: number
) {
  const radio = videoHeight / videoWidth
  video.style.width = videoWidth + 'px'
  video.style.height = videoWidth * radio + 'px'
  canvas.style.width = videoWidth + 'px'
  canvas.style.height = videoWidth * radio + 'px'
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  const drawingUtils = new DrawingUtils(ctx)

  for (const landmarks of facemarksArray) {
    const leftEyePoints = [
      landmarks[263],
      landmarks[385],
      landmarks[386],
      landmarks[387],
      landmarks[362],
      landmarks[380],
      landmarks[374],
      landmarks[373],
    ]
    const rightEyePoints = [
      landmarks[33],
      landmarks[160],
      landmarks[159],
      landmarks[158],
      landmarks[133],
      landmarks[144],
      landmarks[145],
      landmarks[153],
    ]
    const mouthPoints = [
      landmarks[61],
      landmarks[81],
      landmarks[13],
      landmarks[311],
      landmarks[291],
      landmarks[178],
      landmarks[14],
      landmarks[402],
    ]
    drawingUtils.drawLandmarks(leftEyePoints, { color: '#FF0000', radius: 1 })
    drawingUtils.drawLandmarks(rightEyePoints, { color: '#00FF00', radius: 1 })
    drawingUtils.drawLandmarks(mouthPoints, { color: '#0000FF', radius: 1 })
  }
}
